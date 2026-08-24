import { DEFAULT_PAGE_SIZE } from "./constants";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Normalizes Next.js searchParams into a flat string record. */
export async function resolveSearchParams(
  searchParams: Promise<RawSearchParams>
): Promise<Record<string, string>> {
  const raw = await searchParams;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.length > 0) {
      result[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      result[key] = value[0];
    }
  }
  return result;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(
  params: Record<string, string>,
  pageSize = DEFAULT_PAGE_SIZE
): PaginationParams {
  const requestedSize = parsePositiveInt(params.pageSize);
  const size = requestedSize ? Math.min(requestedSize, 100) : pageSize;
  const page = parsePositiveInt(params.page) ?? 1;
  return {
    page,
    pageSize: size,
    skip: (page - 1) * size,
    take: size,
  };
}

/** Builds a URL preserving provided query parameters (skips empties). */
export function buildUrl(
  pathname: string,
  params: Record<string, string | number | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).length > 0) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
