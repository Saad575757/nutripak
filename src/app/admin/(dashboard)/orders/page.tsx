import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  ORDER_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  PAYMENT_STATUSES,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  parsePagination,
  resolveSearchParams,
  getTotalPages,
} from "@/lib/query-params";
import { listOrders } from "@/queries/orders";

export const metadata = { title: "Orders" };

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await resolveSearchParams(searchParams);
  const { page, skip } = parsePagination(params);

  const result = await listOrders({
    search: params.q,
    status: ORDER_STATUSES.includes(params.status as never)
      ? (params.status as (typeof ORDER_STATUSES)[number])
      : undefined,
    paymentStatus: PAYMENT_STATUSES.includes(params.payment as never)
      ? (params.payment as (typeof PAYMENT_STATUSES)[number])
      : undefined,
    periodDays: ["7", "30", "90"].includes(params.period)
      ? Number.parseInt(params.period, 10)
      : undefined,
    skip,
    take: 10,
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description="All Cash on Delivery orders placed through the Nutripak storefront."
      />

      <Card className="gap-0 py-0">
        {/* Filters */}
        <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
          <SearchInput placeholder="Search by order ID or customer…" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
            <FilterSelect
              paramKey="status"
              placeholder="All statuses"
              allLabel="All statuses"
              options={ORDER_STATUSES.map((value) => ({
                value,
                label: ORDER_STATUS_LABELS[value],
              }))}
              ariaLabel="Filter by order status"
            />
            <FilterSelect
              paramKey="payment"
              placeholder="All payments"
              allLabel="All payments"
              options={PAYMENT_STATUSES.map((value) => ({
                value,
                label: `Payment ${PAYMENT_STATUS_LABELS[value].toLowerCase()}`,
              }))}
              ariaLabel="Filter by payment status"
            />
            <FilterSelect
              paramKey="period"
              placeholder="Any date"
              allLabel="Any date"
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
              ]}
              ariaLabel="Filter by date"
            />
          </div>
        </div>

        {result.items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={
              params.q || params.status || params.payment || params.period
                ? "No orders match your filters"
                : "No orders yet"
            }
            description={
              params.q || params.status || params.payment || params.period
                ? "Try adjusting the search or filters."
                : "New COD orders will appear here once the public website is live."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium tabular-nums">
                        {order.orderNumber}
                        <div className="text-muted-foreground text-xs">
                          {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-muted-foreground text-xs">
                          {order.city}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label="COD" tone="primary" withDot={false} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={`Payment ${PAYMENT_STATUS_LABELS[order.paymentStatus].toLowerCase()}`}
                          tone={PAYMENT_STATUS_TONES[order.paymentStatus]}
                          withDot
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={ORDER_STATUS_LABELS[order.status]}
                          tone={ORDER_STATUS_TONES[order.status]}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="gap-1.5">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="size-4" aria-hidden /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-4 border-t p-4">
              <p className="text-muted-foreground text-xs">
                Showing {skip + 1}–{skip + result.items.length} of {result.total}
              </p>
              <Pagination
                currentPage={page}
                totalPages={getTotalPages(result.total, 10)}
                ariaLabel="Orders pagination"
              />
            </div>
          </>
        )}
      </Card>
    </>
  );
}
