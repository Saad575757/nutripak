import { InventoryView } from "@/components/inventory/inventory-view";
import { resolveSearchParams } from "@/lib/query-params";
import { listCategoriesForSelect, listInventory } from "@/queries/products";

export const metadata = { title: "Inventory" };

interface InventoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const params = await resolveSearchParams(searchParams);

  const [categories, result] = await Promise.all([
    listCategoriesForSelect(),
    listInventory({
      search: params.q,
      categoryId: params.category,
      stockLevel:
        params.stock === "low" || params.stock === "out" ? params.stock : undefined,
      skip: 0,
      take: 100,
    }),
  ]);

  return (
    <InventoryView
      hasFilters={Boolean(params.q || params.category || params.stock)}
      categories={categories}
      rows={result.items.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryName: product.category?.name ?? null,
        stockQuantity: product.stockQuantity,
        status: product.status,
      }))}
    />
  );
}
