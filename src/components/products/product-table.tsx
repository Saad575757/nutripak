"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/lib/constants";

export interface ProductTableRow {
  id: string;
  name: string;
  sku: string;
  priceDisplay: string;
  stockQuantity: number;
  status: "ACTIVE" | "INACTIVE";
  imageUrl: string | null;
  categoryName: string | null;
}

const API_BASE = "/api/admin/products";

export function ProductTable({ rows }: { rows: ProductTableRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductTableRow | null>(
    null
  );

  async function toggleStatus(row: ProductTableRow) {
    setBusyId(row.id);
    try {
      const nextStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await fetch(`${API_BASE}/${row.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        toast.error(body?.message ?? "Something went wrong.");
        return;
      }
      toast.success(body?.message ?? "Product updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: ProductTableRow) {
    setDeleteTarget(null);
    setBusyId(row.id);
    try {
      const response = await fetch(`${API_BASE}/${row.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        toast.error(body?.message ?? "Something went wrong.");
        return;
      }
      toast.success("Product deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} data-busy={busyId === row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageOff
                          className="text-muted-foreground size-4"
                          aria-hidden
                        />
                      )}
                    </span>
                    <Link
                      href={`/admin/products/${row.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {row.sku}
                </TableCell>
                <TableCell className="text-sm">{row.categoryName ?? "—"}</TableCell>
                <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                  {row.priceDisplay}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.stockQuantity}
                </TableCell>
                <TableCell>
                  {row.stockQuantity > 0 ? (
                    <StatusBadge label="In Stock" tone="success" />
                  ) : (
                    <StatusBadge label="Out of Stock" tone="danger" />
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={PRODUCT_STATUS_LABELS[row.status]}
                    tone={PRODUCT_STATUS_TONES[row.status]}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busyId === row.id}
                        aria-label={`Actions for ${row.name}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${row.id}`}>
                          <Eye className="size-4" aria-hidden /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${row.id}/edit`}>
                          <Pencil className="size-4" aria-hidden /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => void toggleStatus(row)}
                      >
                        <Power className="size-4" aria-hidden />
                        {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-4" aria-hidden /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Are you sure you want to delete this product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. Past orders keep their records.`
            : ""
        }
        onConfirm={() =>
          deleteTarget ? handleDelete(deleteTarget) : Promise.resolve()
        }
      />
    </>
  );
}

export function AvailabilityHint({ inStock }: { inStock: boolean }) {
  return (
    <Badge variant="outline">{inStock ? "In Stock" : "Out of Stock"}</Badge>
  );
}
