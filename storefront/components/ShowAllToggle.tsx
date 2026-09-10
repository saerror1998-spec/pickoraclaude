import Link from "next/link";

/**
 * Decorative pill that reads as an on/off switch (per the reference design's
 * "Show All" toggles) but is really just a styled link to the full catalog —
 * there's no real per-section show/hide state to toggle.
 */
export function ShowAllToggle({ href = "/shop" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Show all"
      className="group inline-flex h-7 w-14 shrink-0 items-center rounded-full bg-glass-zinc p-1 transition-colors duration-300 hover:bg-glass-violet"
    >
      <span className="sr-only">Show all</span>
      <span className="h-5 w-5 translate-x-7 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-glass)] group-active:translate-x-6" />
    </Link>
  );
}
