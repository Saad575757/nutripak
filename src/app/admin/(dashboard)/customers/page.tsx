import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { listCustomers } from "@/queries/dashboard";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customer information collected through COD orders."
      />

      <Card className="gap-0 py-0">
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers appear here automatically once orders are placed on the storefront."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Order Value</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.phone}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a
                        href={`tel:${customer.phone.replace(/\s+/g, "")}`}
                        className="hover:underline"
                      >
                        {customer.phone}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-48 truncate text-sm">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {customer.orderCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {formatCurrency(customer.totalValue)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDate(customer.lastOrderAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <p className="text-muted-foreground mt-3 text-xs">
        Customer records are derived directly from orders — there is no separate
        customer account system.
      </p>
    </>
  );
}
