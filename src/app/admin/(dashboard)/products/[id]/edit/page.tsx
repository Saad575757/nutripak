import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { listCategoriesForSelect, getProductDetail } from "@/queries/products";

type EditProductPageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductDetail(id),
    listCategoriesForSelect(),
  ]);

  if (!product) {
    notFound();
  }

  const additionalImages = product.images.filter((image) => !image.isMain);
  const mainImage = product.images.find((image) => image.isMain);

  return (
    <>
      <PageHeader
        title="Edit Product"
        description={`Update details for ${product.name}.`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/admin/products/${product.id}`}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </Link>
          </Button>
        }
      />
      <div className="max-w-3xl">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          defaultValues={{
            name: product.name,
            sku: product.sku,
            categoryId: product.category.id,
            price: Number(product.price),
            stockQuantity: product.stockQuantity,
            shortDescription: product.shortDescription ?? "",
            fullDescription: product.fullDescription ?? "",
            ingredients: product.ingredients ?? "",
            benefits: product.benefits ?? "",
            nutritionInfo: product.nutritionInfo ?? "",
            certifications: product.certifications ?? "",
            productSheetUrl: product.productSheetUrl ?? "",
            mainImageUrl: mainImage?.url ?? "",
            additionalImages: additionalImages.map((image) => image.url),
            status: product.status,
          }}
        />
      </div>
    </>
  );
}
