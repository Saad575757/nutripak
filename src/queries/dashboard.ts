import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CustomerRow, DashboardStats, ListResult } from "./types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    activeCategories,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    codAggregate,
    totalCustomers,
    activeCustomers,
    totalContacts,
    newContacts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({
      where: { status: { in: ["CONFIRMED", "PROCESSING"] } },
    }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    // Total COD order value — cancelled orders never collected cash.
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "NEW" } }),
  ]);

  return {
    totalProducts,
    activeProducts,
    totalCategories,
    activeCategories,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    codOrderValue: Number(codAggregate._sum.total ?? 0),
    totalCustomers,
    activeCustomers,
    totalContacts,
    newContacts,
  };
}

export interface CustomerFilters {
  search?: string;
  /** Exact account status, e.g. ACTIVE. */
  status?: string;
  skip?: number;
  take?: number;
}

/** Lists registered storefront accounts with their order history aggregated in. */
export async function listCustomerAccounts(
  filters: CustomerFilters
): Promise<ListResult<CustomerRow>> {
  const where: Prisma.CustomerWhereInput = {};

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
    ];
  }
  if (filters.status) where.status = filters.status;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  // Aggregate linked orders in a single grouped query to avoid N+1 lookups.
  const aggregates = customers.length
    ? await prisma.order.groupBy({
        by: ["customerId"],
        where: { customerId: { in: customers.map((customer) => customer.id) } },
        _count: { _all: true },
        _sum: { total: true },
        _max: { createdAt: true },
      })
    : [];

  const byCustomerId = new Map(
    aggregates.map((row) => [row.customerId, row])
  );

  return {
    items: customers.map((customer) => {
      const aggregate = byCustomerId.get(customer.id);
      return {
        ...customer,
        orderCount: aggregate?._count._all ?? 0,
        totalSpent: Number(aggregate?._sum.total ?? 0),
        lastOrderAt: aggregate?._max.createdAt ?? null,
      };
    }),
    total,
  };
}

/** Distinct account statuses present in the data, for filter options. */
export async function listCustomerStatuses(): Promise<string[]> {
  const rows = await prisma.customer.findMany({
    distinct: ["status"],
    select: { status: true },
    orderBy: { status: "asc" },
  });
  return rows.map((row) => row.status);
}
