import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
