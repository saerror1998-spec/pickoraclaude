"use client";

import Link from "next/link";
import { useWishlist } from "./WishlistProvider";

export function WishlistLink() {
  const { itemCount } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative rounded-full p-2 text-taupe transition-colors hover:text-ink"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.9-9.1C.5 8.1 1.9 4.5 5.4 3.6c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2 3.5.9 4.9 4.5 3.3 7.8C19.5 15.9 12 20.5 12 20.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white tabular-nums">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
