import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import {
  FilterSelect,
  SearchInput,
} from "@/components/shared/table-filters";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accountStatusTone } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  getTotalPages,
  parsePagination,
  resolveSearchParams,
} from "@/lib/query-params";
import { listCustomerAccounts, listCustomerStatuses } from "@/queries/dashboard";

export const metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await resolveSearchParams(searchParams);
  const { page, skip } = parsePagination(params);

  const [result, statuses] = await Promise.all([
    listCustomerAccounts({
      search: params.q,
      status: params.status,
      skip,
      take: 10,
    }),
    listCustomerStatuses(),
  ]);

  const hasFilters = Boolean(params.q || params.status);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Registered storefront accounts and their order history."
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search name, email or phone…" />
          {statuses.length > 0 ? (
            <FilterSelect
              paramKey="status"
              placeholder="All statuses"
              allLabel="All statuses"
              options={statuses.map((status) => ({
                value: status,
                label: status.replaceAll("_", " "),
              }))}
              ariaLabel="Filter by account status"
            />
          ) : null}
        </div>

        {result.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              hasFilters ? "No customers match your filters" : "No customers yet"
            }
            description={
              hasFilters
                ? "Try adjusting the search or filters."
                : "Customer accounts appear here automatically once people register on the storefront."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Total Spent
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Joined</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Last Order
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <a
                          href={`mailto:${customer.email}`}
                          className="text-muted-foreground hover:underline text-xs"
                        >
                          {customer.email}
                        </a>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone.replace(/\s+/g, "")}`}
                            className="hover:underline"
                          >
                            {customer.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={customer.status.replaceAll("_", " ")}
                          tone={accountStatusTone(customer.status)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {customer.orderCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums whitespace-nowrap">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {customer.lastOrderAt
                          ? formatDate(customer.lastOrderAt)
                          : "—"}
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
                ariaLabel="Customers pagination"
              />
            </div>
          </>
        )}
      </Card>
    </>
  );
}
