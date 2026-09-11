import Link from "next/link";

/**
 * Server-rendered pager: plain links so each page is a real, crawlable URL
 * (?page=N) rather than a client-only "load more" that hides content from
 * search engines and requires JS to reach page 2+.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  /** Given a page number, returns the full href for that page (preserving any active filters/sort). */
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {prevDisabled ? (
        <span className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-taupe-light">Previous</span>
      ) : (
        <Link
          href={buildHref(page - 1)}
          className="rounded-[var(--radius-pill)] border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5"
        >
          Previous
        </Link>
      )}

      <span className="px-3 text-sm text-taupe">
        Page {page} of {totalPages}
      </span>

      {nextDisabled ? (
        <span className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-taupe-light">Next</span>
      ) : (
        <Link
          href={buildHref(page + 1)}
          className="rounded-[var(--radius-pill)] border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
