import { z } from "zod";

export const stockUpdateSchema = z.object({
  stockQuantity: z.coerce
    .number({ message: "Enter a valid stock quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock quantity is too large"),
});

export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;
