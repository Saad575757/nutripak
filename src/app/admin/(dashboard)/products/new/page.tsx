import { listCategoriesForSelect } from "@/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await listCategoriesForSelect();

  return (
    <>
      <PageHeader
        title="New Product"
        description="Add a product to the Nutripak catalog."
      />
      <div className="max-w-3xl">
        <ProductForm
          mode="create"
          categories={categories}
          defaultValues={{
            name: "",
            sku: "",
            categoryId: "",
            price: 0,
            stockQuantity: 0,
            status: "ACTIVE",
            additionalImages: [],
          }}
        />
      </div>
    </>
  );
}
