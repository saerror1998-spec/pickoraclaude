import Link from "next/link";

/** Slim premium strip above the navbar. Dark, static (no rotation/marquee), links to the catalog. */
export function AnnouncementBar() {
  return (
    <Link
      href="/shop"
      className="group flex items-center justify-center gap-2 bg-glass-dark py-2 text-center text-xs font-medium text-white/80 transition-colors duration-300 hover:text-white"
    >
      <span>Premium Tech. Smarter Prices. — Shop Refurbished Laptops at Pickora</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 ease-[var(--ease-glass)] group-hover:translate-x-0.5"
      >
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
