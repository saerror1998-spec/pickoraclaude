"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative rounded-full p-2 text-taupe transition-colors hover:text-ink"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6h2l1.5 11h9L18 8H7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.2" fill="currentColor" />
        <circle cx="16" cy="20" r="1.2" fill="currentColor" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white tabular-nums">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
