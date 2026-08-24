"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, SearchX } from "lucide-react";
import { CategoryDialog } from "@/components/categories/category-dialog";
import {
  CategoryTable,
  type CategoryTableRow,
} from "@/components/categories/category-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CategoryViewProps {
  rows: CategoryTableRow[];
  hasFilters: boolean;
}

export function CategoryView({ rows, hasFilters }: CategoryViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryTableRow | null>(null);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize products into shopper-friendly groups."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden /> Add Category
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        {/* Filters */}
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search by category name…" />
          <FilterSelect
            paramKey="status"
            placeholder="All statuses"
            allLabel="All statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            ariaLabel="Filter by status"
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={hasFilters ? SearchX : Layers}
            title={
              hasFilters ? "No categories match your filters" : "No categories yet"
            }
            description={
              hasFilters
                ? "Try a different name or clear the filters."
                : "Create your first category to start organizing products."
            }
          />
        ) : (
          <CategoryTable rows={rows} onEdit={(row) => setEditTarget(row)} />
        )}
      </Card>

      <CategoryDialog
        open={createOpen || editTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditTarget(null);
          }
        }}
        category={
          editTarget
            ? {
                id: editTarget.id,
                name: editTarget.name,
                description: editTarget.description,
                imageUrl: editTarget.imageUrl,
                isActive: editTarget.isActive,
              }
            : null
        }
        onSaved={() => router.refresh()}
      />
    </>
  );
}
