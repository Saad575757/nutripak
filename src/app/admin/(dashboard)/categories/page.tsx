import { CategoryView } from "@/components/categories/category-view";
import { resolveSearchParams } from "@/lib/query-params";
import { listCategories } from "@/queries/categories";

export const metadata = { title: "Categories" };

interface CategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await resolveSearchParams(searchParams);

  const result = await listCategories({
    search: params.q,
    status:
      params.status === "active" || params.status === "inactive"
        ? params.status
        : undefined,
  });

  return (
    <CategoryView
      hasFilters={Boolean(params.q || params.status)}
      rows={result.items.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
      }))}
    />
  );
}
