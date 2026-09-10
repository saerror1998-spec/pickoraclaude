"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CartLink } from "./CartLink";
import { WishlistLink } from "./WishlistLink";
import { AccountMenu } from "./AccountMenu";
import { PillNav } from "./PillNav";
import { AnnouncementBar } from "./AnnouncementBar";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?brand=Dell", label: "Dell" },
  { href: "/shop?brand=HP", label: "HP" },
  { href: "/shop?brand=Lenovo", label: "Lenovo" },
  { href: "/#why-pickora", label: "Why Pickora" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />

      <div className="sticky top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
        <header
          className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-[var(--radius-pill)] border px-3 py-2 backdrop-blur-xl transition-colors duration-300 md:px-4 md:py-2.5 ${
            scrolled
              ? "border-white/10 bg-glass-dark/80"
              : "border-white/10 bg-glass-dark/50"
          }`}
        >
          <Link href="/" className="shrink-0" aria-label="Pickora home">
            <Image
              src="/fevicon.svg"
              alt="Pickora"
              width={689}
              height={198}
              priority
              className="h-6 w-auto brightness-0 invert md:h-7"
            />
          </Link>

          <PillNav items={NAV_LINKS} />

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/shop"
              aria-label="Search"
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>

            <WishlistLink />
            <CartLink />
            <AccountMenu />
          </div>
        </header>
      </div>
    </>
  );
}
