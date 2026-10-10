import { z } from "zod";
import { PRODUCT_STATUSES } from "@/lib/constants";

/**
 * Accepts an empty string (treated as "not provided") or a valid http(s) URL.
 * Kept as a plain union so react-hook-form values round-trip without transforms.
 */
export const optionalUrl = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .max(500, "URL is too long")
    .refine(
      (value) => /^https?:\/\/\S+$/.test(value),
      "Enter a valid URL starting with http:// or https://"
    ),
]);

/**
 * Images may either be an external http(s) URL (legacy entries) or an internal
 * uploaded-media path served from `/api/media/[id]`.
 */
export const optionalImage = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .max(500, "URL is too long")
    .refine(
      (value) =>
        /^https?:\/\/\S+$/.test(value) ||
        /^\/api\/media\/[A-Za-z0-9_-]+$/.test(value),
      "Upload an image or enter a valid image URL"
    ),
]);

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(150, "Product name must be at most 150 characters"),
  sku: z
    .string()
    .trim()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be at most 50 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only")
    .transform((value) => value.toUpperCase()),
  categoryId: z.string().min(1, "Select a category"),

  // The dashboard forms send typed JSON, so plain number schemas keep both
  // sides consistent without coercion surprises.
  price: z
    .number({ message: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(99_999_999, "Price is too large"),
  stockQuantity: z
    .number({ message: "Enter a valid stock quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock quantity is too large"),

  shortDescription: z
    .string()
    .trim()
    .max(300, "Keep the short description under 300 characters")
    .optional(),
  fullDescription: z.string().trim().max(5000).optional(),

  // Nutripak-specific information (all optional)
  ingredients: z.string().trim().max(2000).optional(),
  benefits: z.string().trim().max(2000).optional(),
  nutritionInfo: z.string().trim().max(2000).optional(),
  certifications: z.string().trim().max(500).optional(),
  productSheetUrl: optionalUrl,

  // Media
  mainImageUrl: optionalImage,
  additionalImages: z.array(optionalImage).max(6, "Up to 6 additional images").default([]),

  status: z.enum(PRODUCT_STATUSES),
});

export const productStatusSchema = z.object({
  status: z.enum(PRODUCT_STATUSES),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
