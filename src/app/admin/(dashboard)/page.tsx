import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Mail,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
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
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  parsePagination,
  resolveSearchParams,
  getTotalPages,
} from "@/lib/query-params";
import { getDashboardStats } from "@/queries/dashboard";
import { listOrders } from "@/queries/orders";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await resolveSearchParams(searchParams);
  const { page, skip } = parsePagination(params);

  const status =
    params.status && ORDER_STATUSES.includes(params.status as never)
      ? (params.status as (typeof ORDER_STATUSES)[number])
      : undefined;

  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    listOrders({ search: params.q, status, skip, take: 10 }),
  ]);

  return (
    <>
      <PageHeader
        title="Overview"
        description="A snapshot of products and COD orders across Nutripak."
      />

      {/* Statistics */}
      <section aria-label="Statistics">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={String(stats.totalProducts)}
            supporting={`${stats.activeProducts} active`}
          />
          <StatCard
            icon={Layers}
            label="Total Categories"
            value={String(stats.totalCategories)}
            supporting={`${stats.activeCategories} active`}
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={String(stats.totalOrders)}
            supporting="All time"
          />
          <StatCard
            icon={Banknote}
            label="Total COD Order Value"
            value={formatCurrency(stats.codOrderValue)}
            supporting="Excludes cancelled orders"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={String(stats.pendingOrders)}
            supporting="Awaiting confirmation"
            iconClassName="bg-warning-soft text-warning-text"
          />
          <StatCard
            icon={RefreshCw}
            label="Processing Orders"
            value={String(stats.processingOrders)}
            supporting="Confirmed & preparing"
            iconClassName="bg-info-soft text-info-text"
          />
          <StatCard
            icon={CheckCircle2}
            label="Delivered Orders"
            value={String(stats.deliveredOrders)}
            supporting="COD collected"
            iconClassName="bg-success-soft text-success-text"
          />
          <StatCard
            icon={XCircle}
            label="Cancelled Orders"
            value={String(stats.cancelledOrders)}
            supporting="Not completed"
            iconClassName="bg-danger-soft text-danger-text"
          />
          <StatCard
            icon={Users}
            label="Customers"
            value={String(stats.totalCustomers)}
            supporting={`${stats.activeCustomers} active accounts`}
            iconClassName="bg-info-soft text-info-text"
          />
          <StatCard
            icon={Mail}
            label="Messages"
            value={String(stats.totalContacts)}
            supporting={`${stats.newContacts} new`}
            iconClassName="bg-warning-soft text-warning-text"
          />
        </div>
      </section>

      {/* Recent orders */}
      <section aria-label="Recent orders" className="mt-8">
        <Card>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Recent Orders</h3>
              <p className="text-muted-foreground text-xs">
                {recent.total} order{recent.total === 1 ? "" : "s"} found ·
                Cash on Delivery only
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                placeholder="Search ID or customer…"
                ariaLabel="Search recent orders"
              />
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
            </div>
          </div>

          <CardContent className="p-0">
            {recent.items.length === 0 ? (
              <EmptyState
                title="No orders found"
                description="No COD orders match your search. New orders will appear here once the storefront is live."
                className="py-10"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium tabular-nums">
                          {order.orderNumber}
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
                          <StatusBadge
                            label="COD"
                            tone="primary"
                            withDot={false}
                          />
                          <div className="text-muted-foreground mt-1 text-xs">
                            Payment {PAYMENT_STATUS_LABELS[order.paymentStatus].toLowerCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={ORDER_STATUS_LABELS[order.status]}
                            tone={ORDER_STATUS_TONES[order.status]}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="size-4" aria-hidden />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <div className="flex items-center justify-between gap-4 border-t p-4">
            <p className="text-muted-foreground text-xs">
              Showing{" "}
              {recent.items.length > 0
                ? `${skip + 1}–${skip + recent.items.length} of ${recent.total}`
                : "0"}
            </p>
            <Pagination
              currentPage={page}
              totalPages={getTotalPages(recent.total, 10)}
              ariaLabel="Recent orders pagination"
            />
          </div>
        </Card>
      </section>
    </>
  );
}
