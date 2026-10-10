"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ImageOff,
  LoaderCircle,
  Plus,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";
import { PRODUCT_STATUSES } from "@/lib/constants";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/validations/product";

export interface ProductFormValues {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  shortDescription?: string;
  fullDescription?: string;
  ingredients?: string;
  benefits?: string;
  nutritionInfo?: string;
  certifications?: string;
  productSheetUrl?: string;
  mainImageUrl?: string;
  additionalImages?: string[];
  status: "ACTIVE" | "INACTIVE";
}

interface ProductFormProps {
  categories: { id: string; name: string }[];
  mode: "create" | "edit";
  productId?: string;
  defaultValues: ProductFormValues;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  );
}

const MAX_ADDITIONAL_IMAGES = 6;

export function ProductForm({
  categories,
  mode,
  productId,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultValues,
      status: defaultValues?.status ?? "ACTIVE",
      price: defaultValues?.price ?? 0,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
      additionalImages: defaultValues?.additionalImages ?? [],
    },
  });

  const additionalImages = watch("additionalImages") ?? [];

  async function onSubmit(values: ProductFormOutput) {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError("root", { message: body?.message ?? "Something went wrong." });
        return;
      }

      toast.success(body?.message ?? "Saved.");
      if (mode === "create") {
        router.push("/admin/products");
      } else {
        router.push(`/admin/products/${productId}`);
      }
      router.refresh();
    } catch {
      setError("root", { message: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const gridClasses = "grid gap-4 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Basic information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={gridClasses}>
            <div className="grid gap-2">
              <Label htmlFor="name">
                Product Name <span aria-hidden>*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. SUBSET Daily Multivitamin"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">
                SKU <span aria-hidden>*</span>
              </Label>
              <Input
                id="sku"
                placeholder="e.g. NPK-SUB-001"
                className="font-mono"
                aria-invalid={!!errors.sku}
                {...register("sku")}
              />
              <FieldError message={errors.sku?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">
                Category <span aria-hidden>*</span>
              </Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category" aria-invalid={!!errors.categoryId}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.categoryId?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">
                Product Status <span aria-hidden>*</span>
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value === "ACTIVE" ? "Active" : "Inactive"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-muted-foreground text-xs">
                Inactive products are hidden from the public store.
              </p>
            </div>
          </div>

          <div className={gridClasses}>
            <div className="grid gap-2">
              <Label htmlFor="price">
                Price (PKR) <span aria-hidden>*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 2450"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError message={errors.price?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">
                Stock Quantity <span aria-hidden>*</span>
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 50"
                aria-invalid={!!errors.stockQuantity}
                {...register("stockQuantity", { valueAsNumber: true })}
              />
              <FieldError message={errors.stockQuantity?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              rows={2}
              placeholder="A one-line summary shown in product listings."
              aria-invalid={!!errors.shortDescription}
              {...register("shortDescription")}
            />
            <FieldError message={errors.shortDescription?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              rows={5}
              placeholder="Detailed description shown on the product page."
              aria-invalid={!!errors.fullDescription}
              {...register("fullDescription")}
            />
            <FieldError message={errors.fullDescription?.message} />
          </div>
        </CardContent>
      </Card>

      {/* Nutripak-specific information */}
      <Card>
        <CardHeader>
          <CardTitle>Nutripak Information</CardTitle>
          <p className="text-muted-foreground text-sm font-normal">
            Optional details specific to nutrition products.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={gridClasses}>
            <div className="grid gap-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                rows={3}
                placeholder="Comma-separated ingredient list."
                {...register("ingredients")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                rows={3}
                placeholder="Key customer benefits."
                {...register("benefits")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nutritionInfo">Nutrition Information</Label>
              <Textarea
                id="nutritionInfo"
                rows={3}
                placeholder="Serving size, calories and nutrient breakdown."
                {...register("nutritionInfo")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                rows={3}
                placeholder="e.g. GMP, Halal certified."
                {...register("certifications")}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productSheetUrl">Product Sheet / PDF URL</Label>
            <Input
              id="productSheetUrl"
              type="url"
              placeholder="https://…/product-sheet.pdf"
              aria-invalid={!!errors.productSheetUrl}
              {...register("productSheetUrl")}
            />
            <FieldError message={errors.productSheetUrl?.message} />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <p className="text-muted-foreground text-sm font-normal">
            Upload a main image plus up to {MAX_ADDITIONAL_IMAGES} additional
            images.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="mainImageUrl">Main Image</Label>
            <Controller
              control={control}
              name="mainImageUrl"
              render={({ field }) => (
                <ImageUpload
                  id="mainImageUrl"
                  value={field.value}
                  onChange={field.onChange}
                  alt="Main product image"
                />
              )}
            />
            <FieldError message={errors.mainImageUrl?.message} />
          </div>

          <div className="space-y-3">
            <Label>Additional Images</Label>
            {(additionalImages as string[]).map((_, index) => (
              <div key={index} className="grid gap-1">
                <Controller
                  control={control}
                  name={`additionalImages.${index}` as const}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() =>
                        setValue(
                          "additionalImages",
                          (additionalImages as string[]).filter(
                            (_, i) => i !== index
                          ),
                          { shouldDirty: true }
                        )
                      }
                      alt={`Additional image ${index + 1}`}
                    />
                  )}
                />
                <FieldError
                  message={
                    errors.additionalImages &&
                    Array.isArray(errors.additionalImages)
                      ? errors.additionalImages[index]?.message
                      : undefined
                  }
                />
              </div>
            ))}
            {additionalImages.length >= MAX_ADDITIONAL_IMAGES ? (
              <p className="text-muted-foreground text-xs">
                Maximum of {MAX_ADDITIONAL_IMAGES} additional images.
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = [...(additionalImages as string[]), ""];
                  setValue("additionalImages", next, { shouldDirty: true });
                }}
              >
                <Plus className="size-4" aria-hidden /> Add image
              </Button>
            )}
          </div>

          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <ImageOff className="size-3.5" aria-hidden />
            Products without a main image show a placeholder in listings.
          </p>
        </CardContent>
      </Card>

      {errors.root ? (
        <div
          className="bg-danger-soft text-danger-text border-danger-border rounded-md border px-3 py-2 text-sm"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button asChild variant="outline" type="button">
          <Link href="/admin/products">
            <ArrowLeft className="size-4" aria-hidden /> Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden />
              {mode === "create" ? "Create Product" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
