import { NextResponse } from "next/server";
import {
  notFound,
  parseBody,
  requireApiSession,
  slugify,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { productFormSchema } from "@/validations/product";

function normalizeOptional(value?: string): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let slug = base || "product";
  let suffix = 2;
  // Loop is bounded in practice; slugs derive from unique names/SKUs.
  for (;;) {
    const clash = await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export const POST = withErrorHandling(async (request: Request) => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, productFormSchema);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  const sku = input.sku.toUpperCase();
  const existingSku = await prisma.product.findUnique({
    where: { sku },
    select: { id: true },
  });
  if (existingSku) {
    return NextResponse.json(
      { message: `SKU "${sku}" is already used by another product.` },
      { status: 409 }
    );
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

  const slug = await ensureUniqueSlug(
    `${slugify(input.name)}-${slugify(sku.toLowerCase())}`
  );

  const created = await prisma.product.create({
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
      images: {
        create: [
          ...(input.mainImageUrl
            ? [
                {
                  url: input.mainImageUrl,
                  isMain: true,
                  sortOrder: 0,
                },
              ]
            : []),
          ...input.additionalImages
            .filter((url) => url && url.length > 0)
            .map((url, index) => ({
              url,
              isMain: false,
              sortOrder: index + 1,
            })),
        ],
      },
    },
  });

  return NextResponse.json(
    { message: "Product created successfully.", id: created.id },
    { status: 201 }
  );
});

export const GET = withErrorHandling(async () => {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stockQuantity: true,
      status: true,
    },
  });

  if (!products) return notFound("Products could not be loaded.");
  return NextResponse.json({ items: products });
});
