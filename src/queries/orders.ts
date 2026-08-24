import type {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListResult, OrderListItem } from "./types";

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  /** Filter by creation window, in days (e.g. 7, 30, 90). */
  periodDays?: number;
  skip?: number;
  take?: number;
}

function buildWhere(filters: OrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customerName: { contains: term, mode: "insensitive" } },
      { customerPhone: { contains: term } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  if (filters.periodDays) {
    where.createdAt = {
      gte: new Date(Date.now() - filters.periodDays * 24 * 60 * 60 * 1000),
    };
  }
  return where;
}

export async function listOrders(
  filters: OrderFilters
): Promise<ListResult<OrderListItem>> {
  const where = buildWhere(filters);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        city: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
      } satisfies Prisma.OrderSelect,
    }),
    prisma.order.count({ where }),
  ]);

  // Item counts are needed for supporting info; single grouped query avoids N+1.
  const counts = await prisma.orderItem.groupBy({
    by: ["orderId"],
    where: { orderId: { in: orders.map((o) => o.id) } },
    _sum: { quantity: true },
  });
  const countByOrder = new Map(
    counts.map((row) => [row.orderId, row._sum.quantity ?? 0])
  );

  return {
    items: orders.map((order) => ({
      ...order,
      itemCount: countByOrder.get(order.id) ?? 0,
    })),
    total,
  };
}

export async function getOrderDetail(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { productName: "asc" },
      },
    },
  });
}
