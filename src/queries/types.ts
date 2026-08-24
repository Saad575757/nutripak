import type { Prisma } from "@/generated/prisma/client";

export interface ListResult<T> {
  items: T[];
  total: number;
}

export type OrderListItem = Prisma.OrderGetPayload<{
  select: {
    id: true;
    orderNumber: true;
    customerName: true;
    city: true;
    total: true;
    paymentMethod: true;
    paymentStatus: true;
    status: true;
    createdAt: true;
  };
}> & { itemCount: number };

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: Prisma.Decimal;
  stockQuantity: number;
  status: "ACTIVE" | "INACTIVE";
  imageUrl: string | null;
  categoryName: string | null;
};

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  /** Sum of all COD order totals, excluding cancelled orders. */
  codOrderValue: number;
}
