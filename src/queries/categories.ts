import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListResult } from "./types";

export interface CategoryFilters {
  search?: string;
  /** "active" | "inactive" */
  status?: "active" | "inactive";
  skip?: number;
  take?: number;
}

export const categoryRowSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  _count: {
    select: { products: true },
  },
} satisfies Prisma.CategorySelect;

export type CategoryRowData = Prisma.CategoryGetPayload<{
  select: typeof categoryRowSelect;
}>;

export async function listCategories(
  filters: CategoryFilters
): Promise<ListResult<CategoryRowData>> {
  const where: Prisma.CategoryWhereInput = {};

  if (filters.search) {
    where.name = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }
  if (filters.status) where.isActive = filters.status === "active";

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 100,
      select: categoryRowSelect,
    }),
    prisma.category.count({ where }),
  ]);

  return { items, total };
}
