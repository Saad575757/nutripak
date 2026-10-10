import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContactRow, ListResult } from "./types";

export interface ContactFilters {
  search?: string;
  /** Exact submission status, e.g. NEW. */
  status?: string;
  skip?: number;
  take?: number;
}

const contactSelect = {
  id: true,
  name: true,
  email: true,
  topic: true,
  message: true,
  status: true,
  createdAt: true,
} satisfies Prisma.ContactSelect;

export async function listContacts(
  filters: ContactFilters
): Promise<ListResult<ContactRow>> {
  const where: Prisma.ContactWhereInput = {};

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { topic: { contains: term, mode: "insensitive" } },
      { message: { contains: term, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      select: contactSelect,
    }),
    prisma.contact.count({ where }),
  ]);

  return { items, total };
}

/** Distinct submission statuses present in the data, for filter options. */
export async function listContactStatuses(): Promise<string[]> {
  const rows = await prisma.contact.findMany({
    distinct: ["status"],
    select: { status: true },
    orderBy: { status: "asc" },
  });
  return rows.map((row) => row.status);
}
