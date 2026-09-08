"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

const DOCK_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/#catalog", label: "Shop", icon: "shop" },
  { href: "/cart", label: "Cart", icon: "cart" },
  { href: "/account", label: "Account", icon: "account" },
] as const;

function DockIcon({ name }: { name: (typeof DOCK_ITEMS)[number]["icon"] }) {
  switch (name) {
    case "home":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 11 12 4l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shop":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "cart":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h2l1.5 11h9L18 8H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="20" r="1.2" fill="currentColor" />
          <circle cx="16" cy="20" r="1.2" fill="currentColor" />
        </svg>
      );
    case "account":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
          <path d="M5 20c1.6-3.2 4.3-4.8 7-4.8s5.4 1.6 7 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

/** Floating bottom navigation shown only below the desktop breakpoint. */
export function MobileDock() {
  const { itemCount } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit gap-1 rounded-[var(--radius-pill)] bg-ink/95 px-2 py-2 shadow-[var(--shadow-deep)] backdrop-blur-md lg:hidden"
    >
      {DOCK_ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label === "Cart" ? `Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}` : item.label}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-white/10 hover:text-white"
        >
          <DockIcon name={item.icon} />
          {item.icon === "cart" && itemCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-medium text-ink tabular-nums">
              {itemCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
