"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildPageHref,
  getPageWindow,
} from "@/lib/pagination-links";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  ariaLabel?: string;
}

/**
 * Link-based pagination so paging works without JavaScript.
 * Falls back to plain hrefs; active page is marked with aria-current.
 */
export function Pagination({
  currentPage,
  totalPages,
  ariaLabel = "Pagination",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (page: number) =>
    buildPageHref(pathname, searchParams, page);

  if (totalPages <= 1) return null;

  return (
    <nav aria-label={ariaLabel} className="flex items-center gap-1">
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        disabled={currentPage <= 1}
        aria-disabled={currentPage <= 1}
      >
        <a
          href={hrefFor(currentPage - 1)}
          onClick={(event) => {
            event.preventDefault();
            router.replace(hrefFor(currentPage - 1), { scroll: false });
          }}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </a>
      </Button>

      {getPageWindow(currentPage, totalPages).map((page, index) =>
        page === null ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="text-muted-foreground px-1.5 text-sm"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            asChild
            variant={page === currentPage ? "default" : "outline"}
            size="icon-sm"
            aria-current={page === currentPage ? "page" : undefined}
          >
            <a
              href={hrefFor(page)}
              onClick={(event) => {
                event.preventDefault();
                router.replace(hrefFor(page), { scroll: false });
              }}
              aria-label={`Page ${page}`}
              className="tabular-nums"
            >
              {page}
            </a>
          </Button>
        )
      )}

      <Button
        asChild
        variant="outline"
        size="icon-sm"
        disabled={currentPage >= totalPages}
        aria-disabled={currentPage >= totalPages}
      >
        <a
          href={hrefFor(currentPage + 1)}
          onClick={(event) => {
            event.preventDefault();
            router.replace(hrefFor(currentPage + 1), { scroll: false });
          }}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden />
        </a>
      </Button>
    </nav>
  );
}
