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
  /** Registered storefront customer accounts. */
  totalCustomers: number;
  activeCustomers: number;
  /** Contact form submissions from the storefront. */
  totalContacts: number;
  newContacts: number;
}

/** A registered storefront account with its order history aggregated in. */
export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
}

export type ContactRow = Prisma.ContactGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    topic: true;
    message: true;
    status: true;
    createdAt: true;
  };
}>;
