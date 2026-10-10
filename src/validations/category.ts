import { z } from "zod";
import { optionalImage } from "./product";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must be at most 80 characters"),
  description: z.string().trim().max(500, "Keep it under 500 characters").optional(),
  imageUrl: optionalImage,
  isActive: z.boolean(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
