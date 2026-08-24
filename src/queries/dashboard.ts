import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "./types";

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
  };
}

/** Distinct customers aggregated from orders (basic, no CRM). */
export interface CustomerSummary {
  phone: string;
  name: string;
  email: string | null;
  city: string;
  address: string;
  orderCount: number;
  totalValue: number;
  lastOrderAt: Date;
}

export async function listCustomers(): Promise<CustomerSummary[]> {
  // Basic scale: aggregate in memory over indexed columns. Revisit with SQL
  // grouping if the storefront grows beyond tens of thousands of orders.
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      customerPhone: true,
      customerName: true,
      customerEmail: true,
      city: true,
      address: true,
      total: true,
      createdAt: true,
    },
  });

  const byPhone = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const existing = byPhone.get(order.customerPhone);
    if (!existing) {
      byPhone.set(order.customerPhone, {
        phone: order.customerPhone,
        name: order.customerName,
        email: order.customerEmail,
        city: order.city,
        address: order.address,
        orderCount: 1,
        totalValue: Number(order.total),
        lastOrderAt: order.createdAt,
      });
    } else {
      existing.orderCount += 1;
      existing.totalValue += Number(order.total);
    }
  }

  return [...byPhone.values()].sort((a, b) => b.totalValue - a.totalValue);
}
