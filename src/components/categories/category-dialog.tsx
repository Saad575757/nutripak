"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { categoryFormSchema } from "@/validations/category";

export interface CategoryDialogRow {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit mode; absent → create mode. */
  category?: CategoryDialogRow | null;
  onSaved: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const imageUrl = watch("imageUrl");

  // Reset the form each time the dialog opens for a different target.
  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      isActive: category?.isActive ?? true,
    });
  }, [open, category, reset]);

  async function onSubmit(values: {
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  }) {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        category ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
        {
          method: category ? "PATCH" : "POST",
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
      onOpenChange(false);
      onSaved();
    } catch {
      setError("root", { message: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? `Update details for "${category.name}".`
              : "Create a new product category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">
              Category Name <span aria-hidden>*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Nutritional Supplements"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              rows={3}
              placeholder="Short description shown to shoppers."
              {...register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-image">Image</Label>
            <ImageUpload
              id="category-image"
              value={imageUrl}
              onChange={(url) =>
                setValue("imageUrl", url, { shouldDirty: true })
              }
              alt={category?.name ?? "Category image"}
            />
            {errors.imageUrl ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.imageUrl.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-status">
              Status <span aria-hidden>*</span>
            </Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(value) =>
                setValue("isActive", value === "active", {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="category-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Inactive categories are hidden from the public store.
            </p>
          </div>

          {errors.root ? (
            <div
              className="bg-danger-soft text-danger-text border-danger-border rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden />
                  {category ? "Save Changes" : "Create Category"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
