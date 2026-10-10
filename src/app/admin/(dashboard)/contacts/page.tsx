import { Mail } from "lucide-react";
import { ContactMessage } from "@/components/contacts/contact-message";
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
import { contactStatusTone } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import {
  getTotalPages,
  parsePagination,
  resolveSearchParams,
} from "@/lib/query-params";
import { listContacts, listContactStatuses } from "@/queries/contacts";

export const metadata = { title: "Messages" };

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await resolveSearchParams(searchParams);
  const { page, skip } = parsePagination(params);

  const [result, statuses] = await Promise.all([
    listContacts({
      search: params.q,
      status: params.status,
      skip,
      take: 10,
    }),
    listContactStatuses(),
  ]);

  const hasFilters = Boolean(params.q || params.status);

  return (
    <>
      <PageHeader
        title="Messages"
        description="Contact form submissions from the Nutripak storefront."
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search name, email or subject…" />
          {statuses.length > 0 ? (
            <FilterSelect
              paramKey="status"
              placeholder="All statuses"
              allLabel="All statuses"
              options={statuses.map((status) => ({
                value: status,
                label: status.replaceAll("_", " "),
              }))}
              ariaLabel="Filter by message status"
            />
          ) : null}
        </div>

        {result.items.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={hasFilters ? "No messages match your filters" : "No messages yet"}
            description={
              hasFilters
                ? "Try adjusting the search or filters."
                : "Contact form submissions will appear here once the storefront is live."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Received
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{contact.name}</div>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-muted-foreground hover:underline text-xs"
                        >
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell className="align-top">
                        {contact.topic ?? "—"}
                      </TableCell>
                      <TableCell className="align-top">
                        <ContactMessage
                          name={contact.name}
                          email={contact.email}
                          topic={contact.topic}
                          message={contact.message}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusBadge
                          label={contact.status.replaceAll("_", " ")}
                          tone={contactStatusTone(contact.status)}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-sm whitespace-nowrap align-top">
                        {formatDateTime(contact.createdAt)}
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
                ariaLabel="Messages pagination"
              />
            </div>
          </>
        )}
      </Card>
    </>
  );
}
