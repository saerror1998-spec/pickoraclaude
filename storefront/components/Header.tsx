import Image from "next/image";
import Link from "next/link";
import { CartLink } from "./CartLink";
import { AccountMenu } from "./AccountMenu";

const NAV_LINKS = [
  { href: "/#catalog", label: "Shop" },
  { href: "/#catalog", label: "Laptops" },
  { href: "/#why-pickora", label: "Why Pickora" },
  { href: "/support", label: "Support" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-[var(--gutter-mobile)] py-4 md:px-[var(--gutter-desktop)]">
        <Link href="/" className="shrink-0" aria-label="Pickora home">
          <Image
            src="/fevicon.svg"
            alt="Pickora"
            width={689}
            height={198}
            priority
            className="h-7 w-auto md:h-8"
          />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-taupe transition-colors duration-200 ease-[var(--ease-expo-out)] hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 text-taupe transition-colors hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <CartLink />

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
