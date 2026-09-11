import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

/** Picks a real, premium-looking in-stock unit for the banner photo — the highest-priced item, not a fabricated "hero" pick. */
function pickShowcaseProduct(products: Product[]): Product | undefined {
  const inStock = products.filter((p) => p.inStock);
  return [...inStock].sort((a, b) => b.priceCents - a.priceCents)[0];
}

export function PromoBanner({ products }: { products: Product[] }) {
  const product = pickShowcaseProduct(products);
  if (!product) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]">
      <div className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-section-mobile)] bg-gradient-to-br from-glass-zinc to-glass-dark md:grid-cols-2 md:rounded-[var(--radius-section)]">
        <div className="relative aspect-[4/3] w-full md:aspect-auto">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-8 py-12 md:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Certified Refurbished</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-white">
            Certified Refurbished. Backed by a 90-Day Warranty.
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Every laptop is diagnosed, repaired where needed, deep cleaned, and graded before it&apos;s
            listed — then covered for 90 days from the day it ships.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-medium text-zinc-900 transition-transform duration-300 ease-[var(--ease-glass)] hover:scale-105"
          >
            Shop Laptops
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
