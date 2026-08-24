import { NextResponse } from "next/server";
import {
  jsonError,
  parseBody,
  requireApiSession,
  withErrorHandling,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { categoryFormSchema } from "@/validations/category";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeOptional(value?: string): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export const PATCH = withErrorHandling(
  async (request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return jsonError("Category not found.", 404);
    }

    const parsed = await parseBody(request, categoryFormSchema);
    if (parsed.error) return parsed.error;
    const input = parsed.data;

    const name = input.name.trim();
    if (name !== existing.name) {
      const nameClash = await prisma.category.findUnique({
        where: { name },
        select: { id: true },
      });
      if (nameClash && nameClash.id !== id) {
        return NextResponse.json(
          { message: `A category named "${name}" already exists.` },
          { status: 409 }
        );
      }
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        description: normalizeOptional(input.description),
        imageUrl: normalizeOptional(input.imageUrl),
        isActive: input.isActive,
      },
    });

    return NextResponse.json({ message: "Category updated successfully." });
  }
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: RouteContext) => {
    const auth = await requireApiSession();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
      },
    });
    if (!existing) {
      return jsonError("Category not found. It may have been removed already.", 404);
    }

    // Business rule: categories with products must be emptied first.
    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          message: `"${existing.name}" contains ${existing._count.products} product${
            existing._count.products === 1 ? "" : "s"
          }. Reassign its products to another category before deleting.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted successfully." });
  }
);
