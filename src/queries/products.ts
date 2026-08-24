import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { ListResult } from "./types";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  /** "in" = in stock, "out" = zero stock. */
  availability?: "in" | "out";
  skip?: number;
  take?: number;
}

export const productRowSelect = {
  id: true,
  name: true,
  sku: true,
  price: true,
  stockQuantity: true,
  status: true,
  categoryId: true,
  category: { select: { name: true } },
  images: {
    where: { isMain: true },
    select: { url: true },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type ProductRowData = Prisma.ProductGetPayload<{
  select: typeof productRowSelect;
}>;

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ];
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;
  if (filters.availability === "in") where.stockQuantity = { gt: 0 };
  if (filters.availability === "out") where.stockQuantity = 0;

  return where;
}

export async function listProducts(
  filters: ProductFilters
): Promise<ListResult<ProductRowData>> {
  const where = buildWhere(filters);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      select: productRowSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function getProductDetail(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listCategoriesForSelect() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Inventory view — same rows plus low-stock classification. */
export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  /** "low" = at/below threshold but not zero, "out" = zero. */
  stockLevel?: "low" | "out";
  status?: ProductStatus;
  skip?: number;
  take?: number;
}

export async function listInventory(
  filters: InventoryFilters
): Promise<ListResult<ProductRowData>> {
  const base = buildWhere({
    search: filters.search,
    categoryId: filters.categoryId,
    status: filters.status,
  });

  if (filters.stockLevel === "out") {
    base.stockQuantity = 0;
  } else if (filters.stockLevel === "low") {
    base.stockQuantity = {
      gt: 0,
      lte: LOW_STOCK_THRESHOLD,
    };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: base,
      orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      select: productRowSelect,
    }),
    prisma.product.count({ where: base }),
  ]);

  return { items, total };
}
