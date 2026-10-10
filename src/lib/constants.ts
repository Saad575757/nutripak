import type {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
} from "@/generated/prisma/client";
import type { Tone } from "@/components/status-badge";

export const APP_NAME = "Nutripak";
export const APP_TAGLINE = "Admin Dashboard";

/** Stock at or below this value is considered low. */
export const LOW_STOCK_THRESHOLD = 10;

/** Flat delivery charge applied to every order (COD). */
export const DELIVERY_CHARGES = 200;

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "COLLECTED"];

export const PRODUCT_STATUSES: ProductStatus[] = ["ACTIVE", "INACTIVE"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  COLLECTED: "Collected",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

/** Delivery status is derived from order processing state — no separate source of truth. */
export const DELIVERY_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Awaiting confirmation",
  CONFIRMED: "Preparing",
  PROCESSING: "Preparing",
  SHIPPED: "In transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "primary",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, Tone> = {
  PENDING: "warning",
  COLLECTED: "success",
};

export const PRODUCT_STATUS_TONES: Record<ProductStatus, Tone> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
};

/** Customer account status is stored as free text by the storefront. */
export function accountStatusTone(status: string): Tone {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "BLOCKED":
    case "SUSPENDED":
    case "INACTIVE":
      return "danger";
    default:
      return "neutral";
  }
}

/** Contact form status is stored as free text by the storefront. */
export function contactStatusTone(status: string): Tone {
  switch (status.toUpperCase()) {
    case "NEW":
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
    case "PENDING":
      return "warning";
    case "RESOLVED":
    case "CLOSED":
      return "success";
    default:
      return "neutral";
  }
}
