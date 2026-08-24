"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
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
import { formatDate } from "@/lib/format";

export interface CategoryTableRow {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

const API_BASE = "/api/admin/categories";

interface CategoryTableProps {
  rows: CategoryTableRow[];
  onEdit: (row: CategoryTableRow) => void;
}

export function CategoryTable({ rows, onEdit }: CategoryTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryTableRow | null>(
    null
  );

  async function toggleActive(row: CategoryTableRow) {
    setBusyId(row.id);
    try {
      const response = await fetch(`${API_BASE}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          description: row.description ?? "",
          imageUrl: row.imageUrl ?? "",
          isActive: !row.isActive,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        toast.error(body?.message ?? "Something went wrong.");
        return;
      }
      toast.success(
        row.isActive ? "Category deactivated." : "Category activated."
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: CategoryTableRow) {
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
      toast.success(body?.message ?? "Category deleted successfully.");
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
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-medium">{row.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                  {row.description ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.productCount}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={row.isActive ? "Active" : "Inactive"}
                    tone={row.isActive ? "success" : "neutral"}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDate(row.createdAt)}
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
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        <Pencil className="size-4" aria-hidden /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void toggleActive(row)}>
                        <Power className="size-4" aria-hidden />
                        {row.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={row.productCount > 0}
                        onClick={() => setDeleteTarget(row)}
                        title={
                          row.productCount > 0
                            ? "Reassign this category's products first."
                            : undefined
                        }
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

      {/* Deletion is blocked server-side while products remain assigned. */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Are you sure you want to delete this category?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed.`
            : ""
        }
        onConfirm={() =>
          deleteTarget ? handleDelete(deleteTarget) : Promise.resolve()
        }
      />
    </>
  );
}
