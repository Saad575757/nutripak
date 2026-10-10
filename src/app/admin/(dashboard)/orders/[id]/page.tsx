import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CreditCard,
  Hash,
  MapPin,
  Package,
  Phone,
  Mail,
  Truck,
  User,
} from "lucide-react";
import { OrderStatusSelect, PaymentStatusSelect } from "@/components/orders/status-selects";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DELIVERY_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getOrderDetail } from "@/queries/orders";

type OrderDetailPageProps = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {order.orderNumber}
            <StatusBadge
              label={ORDER_STATUS_LABELS[order.status]}
              tone={ORDER_STATUS_TONES[order.status]}
            />
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-3.5" aria-hidden />
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" aria-hidden /> Back to orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              Customer Information
              {order.customer ? (
                <StatusBadge
                  label="Registered account"
                  tone="info"
                  withDot={false}
                  className="font-normal"
                />
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <User className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
                <div>
                  <dt className="text-muted-foreground text-xs">Name</dt>
                  <dd className="font-medium">{order.customerName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
                <div>
                  <dt className="text-muted-foreground text-xs">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${order.customerPhone.replace(/\s+/g, "")}`}
                      className="hover:underline"
                    >
                      {order.customerPhone}
                    </a>
                  </dd>
                </div>
              </div>
              {order.customerEmail ? (
                <div className="flex items-start gap-2.5">
                  <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
                  <div>
                    <dt className="text-muted-foreground text-xs">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="break-all hover:underline"
                      >
                        {order.customerEmail}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-2.5">
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
                <div>
                  <dt className="text-muted-foreground text-xs">Address</dt>
                  <dd>{order.address}</dd>
                </div>
              </div>
            </dl>

            {order.notes ? (
              <>
                <Separator className="my-4" />
                <p className="text-muted-foreground text-xs">
                  <span className="font-medium text-foreground">Notes: </span>
                  {order.notes}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 border-primary/15 flex items-center gap-3 rounded-lg border p-3">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <Banknote className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="text-muted-foreground text-xs">
                  Customer pays cash when the parcel arrives.
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                COD payment status
              </p>
              <PaymentStatusSelect
                orderId={order.id}
                value={order.paymentStatus}
              />
            </div>

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery charges</dt>
                <dd className="tabular-nums">{formatCurrency(order.deliveryCharges)}</dd>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <dt>Total (COD)</dt>
                <dd className="tabular-nums">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2.5">
              <Truck className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Delivery status
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {DELIVERY_STATUS_LABELS[order.status]}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Follows the order status automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Shipping address
                </p>
                <p className="mt-0.5 text-sm">
                  {order.address}
                  <br />
                  {order.city}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span className="text-muted-foreground">Delivery charges</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(order.deliveryCharges)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order items + summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Products ({order.items.length})</CardTitle>
            <div className="flex items-center gap-2">
              <CreditCard className="text-muted-foreground size-4" aria-hidden />
              <PaymentStatusSelect
                orderId={order.id}
                value={order.paymentStatus}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="pr-6 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-56 truncate pl-6 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <Package
                            className="text-muted-foreground size-3.5 shrink-0"
                            aria-hidden
                          />
                          {item.productName}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right tabular-nums whitespace-nowrap">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="pr-6 text-right font-medium tabular-nums whitespace-nowrap">
                        {formatCurrency(Number(item.unitPrice) * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t p-6 lg:w-72 lg:ml-auto">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery charges</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(order.deliveryCharges)}
                  </dd>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        {/* Order management */}
        <Card>
          <CardHeader>
            <CardTitle>Manage order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2.5">
              <Hash className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Order status
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {ORDER_STATUS_LABELS[order.status]}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                Update status
              </p>
              <OrderStatusSelect orderId={order.id} value={order.status} />
            </div>

            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                Update COD payment
              </p>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={`Payment ${PAYMENT_STATUS_LABELS[order.paymentStatus].toLowerCase()}`}
                  tone={PAYMENT_STATUS_TONES[order.paymentStatus]}
                />
                <PaymentStatusSelect
                  orderId={order.id}
                  value={order.paymentStatus}
                />
              </div>
            </div>

            <p className="text-muted-foreground text-xs">
              Marking the order as delivered usually means cash has been
              collected — remember to update the payment status.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
