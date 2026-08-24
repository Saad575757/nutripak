import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  FileText,
  ImageOff,
  Pencil,
  Pill,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_TONES,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getProductDetail } from "@/queries/products";

type ProductPageProps = { params: Promise<{ id: string }> };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="mt-0.5 text-sm whitespace-pre-line">{value}</dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  const availability =
    product.stockQuantity > 0 ? (
      <StatusBadge
        label={product.stockQuantity <= LOW_STOCK_THRESHOLD ? "Low Stock" : "In Stock"}
        tone={product.stockQuantity <= LOW_STOCK_THRESHOLD ? "warning" : "success"}
      />
    ) : (
      <StatusBadge label="Out of Stock" tone="danger" />
    );

  return (
    <>
      <PageHeader
        title={product.name}
        description={`SKU ${product.sku}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/products">
                <ArrowLeft className="size-4" aria-hidden /> Back to products
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Pencil className="size-4" aria-hidden /> Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gallery */}
        <Card className="lg:col-span-1">
          <CardContent>
            <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    product.images.find((image) => image.isMain)?.url ??
                    product.images[0].url
                  }
                  alt={product.name}
                  className="size-full object-contain"
                />
              ) : (
                <ImageOff
                  className="text-muted-foreground size-10"
                  aria-hidden
                />
              )}
            </div>
            {product.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="bg-muted aspect-square overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt ?? `${product.name} image`}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Summary + details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <CardTitle>Product summary</CardTitle>
              <div className="flex items-center gap-2">
                {availability}
                <StatusBadge
                  label={PRODUCT_STATUS_LABELS[product.status]}
                  tone={PRODUCT_STATUS_TONES[product.status]}
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
              <InfoRow label="Category" value={product.category.name} />
              <InfoRow
                label="Price"
                value={`${formatCurrency(product.price)} PKR`}
              />
              <InfoRow
                label="Stock Quantity"
                value={`${product.stockQuantity} units`}
              />
              {product.shortDescription ? (
                <div className="sm:col-span-3">
                  <InfoRow
                    label="Short description"
                    value={product.shortDescription}
                  />
                </div>
              ) : null}
              {product.fullDescription ? (
                <div className="sm:col-span-3">
                  <InfoRow
                    label="Full description"
                    value={product.fullDescription}
                  />
                </div>
              ) : null}
              <div className="sm:col-span-3">
                <dt className="text-muted-foreground text-xs font-medium">
                  Slug (for public store)
                </dt>
                <dd className="mt-0.5">
                  <Badge variant="outline" className="font-mono text-xs">
                    /{product.slug}
                  </Badge>
                </dd>
              </div>
            </CardContent>
          </Card>

          {(product.ingredients ||
            product.benefits ||
            product.nutritionInfo ||
            product.certifications ||
            product.productSheetUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>Nutripak information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {product.ingredients ? (
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Pill className="size-3.5" aria-hidden /> Ingredients
                      </dt>
                      <dd className="mt-0.5 text-sm whitespace-pre-line">
                        {product.ingredients}
                      </dd>
                    </div>
                  ) : null}
                  {product.benefits ? (
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Sparkles className="size-3.5" aria-hidden /> Benefits
                      </dt>
                      <dd className="mt-0.5 text-sm whitespace-pre-line">
                        {product.benefits}
                      </dd>
                    </div>
                  ) : null}
                  {product.nutritionInfo ? (
                    <div>
                      <dt className="text-muted-foreground text-xs font-medium">
                        Nutrition information
                      </dt>
                      <dd className="mt-0.5 text-sm whitespace-pre-line">
                        {product.nutritionInfo}
                      </dd>
                    </div>
                  ) : null}
                  {product.certifications ? (
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Award className="size-3.5" aria-hidden /> Certifications
                      </dt>
                      <dd className="mt-0.5 text-sm whitespace-pre-line">
                        {product.certifications}
                      </dd>
                    </div>
                  ) : null}
                  {product.productSheetUrl ? (
                    <div className="sm:col-span-2">
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <FileText className="size-3.5" aria-hidden /> Product sheet
                      </dt>
                      <dd className="mt-0.5 text-sm">
                        <a
                          href={product.productSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          Open product sheet (PDF)
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
