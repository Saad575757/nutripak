import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  parsePagination,
  resolveSearchParams,
  getTotalPages,
} from "@/lib/query-params";
import {
  listCategoriesForSelect,
  listProducts,
} from "@/queries/products";
import { ProductTable } from "@/components/products/product-table";

export const metadata = { title: "Products" };

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await resolveSearchParams(searchParams);
  const { page, skip } = parsePagination(params);

  const [categories, result] = await Promise.all([
    listCategoriesForSelect(),
    listProducts({
      search: params.q,
      categoryId: params.category,
      status:
        params.status === "ACTIVE" || params.status === "INACTIVE"
          ? params.status
          : undefined,
      availability:
        params.availability === "in" || params.availability === "out"
          ? params.availability
          : undefined,
      skip,
      take: 10,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage the Nutripak catalog — pricing, stock and product information."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" aria-hidden /> Add Product
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        {/* Filters */}
        <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
          <SearchInput placeholder="Search by name or SKU…" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
            <FilterSelect
              paramKey="category"
              placeholder="All categories"
              allLabel="All categories"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              ariaLabel="Filter by category"
            />
            <FilterSelect
              paramKey="status"
              placeholder="All statuses"
              allLabel="All statuses"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              ariaLabel="Filter by status"
            />
            <FilterSelect
              paramKey="availability"
              placeholder="All stock"
              allLabel="All stock"
              options={[
                { value: "in", label: "In Stock" },
                { value: "out", label: "Out of Stock" },
              ]}
              ariaLabel="Filter by availability"
            />
          </div>
        </div>

        {result.items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={params.q ? "No products match your search" : "No products yet"}
            description={
              params.q
                ? "Try a different name or SKU, or clear the filters."
                : "Add your first Nutripak product to get started."
            }
            action={
              !params.q ? (
                <Button asChild>
                  <Link href="/admin/products/new">Add Product</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/admin/products">Clear filters</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <ProductTable
              rows={result.items.map((product) => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                priceDisplay: formatCurrency(product.price),
                stockQuantity: product.stockQuantity,
                status: product.status,
                imageUrl: product.images[0]?.url ?? null,
                categoryName: product.category?.name ?? null,
              }))}
            />
            <div className="flex items-center justify-between gap-4 border-t p-4">
              <p className="text-muted-foreground text-xs">
                Showing {skip + 1}–{skip + result.items.length} of{" "}
                {result.total}
              </p>
              <Pagination
                currentPage={page}
                totalPages={getTotalPages(result.total, 10)}
                ariaLabel="Products pagination"
              />
            </div>
          </>
        )}
      </Card>
    </>
  );
}
