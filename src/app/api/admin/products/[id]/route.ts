import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  slugify,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { productFormSchema } from "@/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeOptional(value?: string): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

async function ensureUniqueSlug(base: string, excludeId: string) {
  let slug = base || "product";
  let suffix = 2;
  for (;;) {
    const clash = await prisma.product.findFirst({
      where: { slug, id: { not: excludeId } },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, sku: true },
    });
    if (!existing) {
      return jsonError("Product not found.", 404);
    }

    const parsed = await parseBody(request, productFormSchema);
    if (parsed.error) return parsed.error;
    const input = parsed.data;

    const sku = input.sku.toUpperCase();
    if (sku !== existing.sku) {
      const skuClash = await prisma.product.findUnique({
        where: { sku },
        select: { id: true },
      });
      if (skuClash && skuClash.id !== id) {
        return NextResponse.json(
          { message: `SKU "${sku}" is already used by another product.` },
          { status: 409 }
        );
      }
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Selected category no longer exists." },
        { status: 422 }
      );
    }

    const slug = await ensureUniqueSlug(`${slugify(input.name)}-${slugify(sku.toLowerCase())}`, id);

    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: {
          name: input.name.trim(),
          sku,
          slug,
          shortDescription: normalizeOptional(input.shortDescription),
          fullDescription: normalizeOptional(input.fullDescription),
          price: input.price,
          stockQuantity: input.stockQuantity,
          ingredients: normalizeOptional(input.ingredients),
          benefits: normalizeOptional(input.benefits),
          nutritionInfo: normalizeOptional(input.nutritionInfo),
          certifications: normalizeOptional(input.certifications),
          productSheetUrl: normalizeOptional(input.productSheetUrl),
          status: input.status,
          categoryId: input.categoryId,
        },
      }),
      // Replace image set with the submitted list.
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productImage.createMany({
        data: [
          ...(input.mainImageUrl
            ? [
                {
                  productId: id,
                  url: input.mainImageUrl,
                  isMain: true,
                  sortOrder: 0,
                },
              ]
            : []),
          ...input.additionalImages
            .filter((url) => url && url.length > 0)
            .map((url, index) => ({
              productId: id,
              url,
              isMain: false,
              sortOrder: index + 1,
            })),
        ],
      }),
    ]);

    return NextResponse.json({ message: "Product updated successfully." });
  }
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError("Product not found. It may have been removed already.", 404);
    }

    // Order items keep their product snapshots via onDelete: SetNull.
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted successfully." });
  }
);
