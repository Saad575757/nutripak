import type { ReadonlyURLSearchParams } from "next/navigation";

/** Builds an href for a given page, preserving all other query parameters. */
export function buildPageHref(
  pathname: string,
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  page: number
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Returns a window of page numbers with nulls as ellipsis markers. */
export function getPageWindow(
  current: number,
  total: number,
  windowSize = 5
): (number | null)[] {
  if (total <= windowSize + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages: (number | null)[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push(null);
  }
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < total) {
    if (end < total - 1) pages.push(null);
    pages.push(total);
  }
  return pages;
}
