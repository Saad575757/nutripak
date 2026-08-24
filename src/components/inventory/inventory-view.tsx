"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  LoaderCircle,
  Save,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export interface InventoryTableRow {
  id: string;
  name: string;
  sku: string;
  categoryName: string | null;
  stockQuantity: number;
  status: "ACTIVE" | "INACTIVE";
}

interface StockDialogTarget {
  id: string;
  name: string;
  stockQuantity: number;
}

function StockUpdateDialog({
  target,
  onClose,
}: {
  target: StockDialogTarget | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<{ stockQuantity: number }>({
    defaultValues: { stockQuantity: target?.stockQuantity ?? 0 },
  });

  // Sync the value whenever a different product is opened.
  const [lastId, setLastId] = useState<string | null>(null);
  if (target && target.id !== lastId) {
    setLastId(target.id);
    reset({ stockQuantity: target.stockQuantity });
  }

  async function onSubmit(values: { stockQuantity: number }) {
    if (!target) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/inventory/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError("root", {
          message: body?.message ?? "Something went wrong.",
        });
        return;
      }
      toast.success(body?.message ?? "Stock updated successfully.");
      onClose();
      router.refresh();
    } catch {
      setError("root", { message: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update stock</DialogTitle>
          <DialogDescription>
            Set the current stock quantity for{" "}
            <span className="font-medium text-foreground">{target?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">
              Stock Quantity <span aria-hidden>*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min={0}
              step={1}
              autoFocus
              aria-invalid={!!errors.stockQuantity}
              {...register("stockQuantity", { valueAsNumber: true })}
            />
            {errors.stockQuantity ? (
              <p className="text-destructive text-xs" role="alert">
                {errors.stockQuantity.message}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Products at or below {LOW_STOCK_THRESHOLD} units are flagged as
                low stock.
              </p>
            )}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden /> Update Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface InventoryViewProps {
  rows: InventoryTableRow[];
  categories: { id: string; name: string }[];
  hasFilters: boolean;
}

function availability(row: InventoryTableRow) {
  if (row.stockQuantity === 0)
    return <StatusBadge label="Out of Stock" tone="danger" />;
  if (row.stockQuantity <= LOW_STOCK_THRESHOLD)
    return <StatusBadge label="Low Stock" tone="warning" />;
  return <StatusBadge label="In Stock" tone="success" />;
}

export function InventoryView({
  rows,
  categories,
  hasFilters,
}: InventoryViewProps) {
  const [stockTarget, setStockTarget] = useState<StockDialogTarget | null>(
    null
  );

  const lowCount = rows.filter(
    (row) => row.stockQuantity > 0 && row.stockQuantity <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`View and update stock levels. ${lowCount > 0 && !hasFilters ? `${lowCount} of the shown products are low on stock.` : ""}`}
      />

      <Card className="gap-0 py-0">
        {/* Filters */}
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search products…" />
          <FilterSelect
            paramKey="category"
            placeholder="All categories"
            allLabel="All categories"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            ariaLabel="Filter by category"
          />
          <FilterSelect
            paramKey="stock"
            placeholder="All stock levels"
            allLabel="All stock levels"
            options={[
              { value: "low", label: `Low (≤ ${LOW_STOCK_THRESHOLD})` },
              { value: "out", label: "Out of stock" },
            ]}
            ariaLabel="Filter by stock level"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={hasFilters ? AlertTriangle : Warehouse}
            title={
              hasFilters ? "No products match your filters" : "No inventory yet"
            }
            description={
              hasFilters
                ? "Try different filters or add stock to your products."
                : "Products will appear here once added to the catalog."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {row.sku}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.categoryName ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {row.stockQuantity}
                      {row.stockQuantity <= LOW_STOCK_THRESHOLD ? (
                        <span className="sr-only">
                          {row.stockQuantity === 0
                            ? "(out of stock)"
                            : "(low stock)"}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{availability(row)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={row.status === "ACTIVE" ? "Active" : "Inactive"}
                        tone={row.status === "ACTIVE" ? "success" : "neutral"}
                        withDot={false}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setStockTarget({
                            id: row.id,
                            name: row.name,
                            stockQuantity: row.stockQuantity,
                          })
                        }
                      >
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <StockUpdateDialog
        target={stockTarget}
        onClose={() => setStockTarget(null)}
      />
    </>
  );
}
