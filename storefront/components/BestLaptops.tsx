"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ShowAllToggle } from "./ShowAllToggle";
import { BlurInStaggerGrid } from "./BlurInStaggerGrid";
import type { Product } from "@/lib/types";

// A site-review report flagged this section rendering up to 60 products —
// effectively the whole catalog re-embedded on the homepage instead of a
// curated highlight — as a heavy, purpose-diluting page that duplicates
// /shop. Capped to a genuinely curated row instead; /shop is one click away.
const MAX_FEATURED = 8;

// Matches the header nav's brand links exactly.
const FILTER_PILLS = ["All", "Dell", "HP", "Lenovo"] as const;

export function BestLaptops({ products }: { products: Product[] }) {
  const [activeBrand, setActiveBrand] = useState<(typeof FILTER_PILLS)[number]>("All");

  const bestSellers = products.filter((p) => p.condition === "Excellent" && p.inStock);
  const filtered =
    activeBrand === "All" ? bestSellers : bestSellers.filter((p) => p.brand === activeBrand);
  const featured = filtered.slice(0, MAX_FEATURED);

  if (bestSellers.length === 0) return null;

  return (
    <section
      aria-label="Best sellers"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="type-label-md text-ink">Best Sellers</h2>
          <p className="mt-1 text-sm text-taupe">Excellent-condition units, in stock and ready to ship.</p>
        </div>
        <ShowAllToggle href="/shop" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter best sellers by brand">
        {FILTER_PILLS.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => setActiveBrand(brand)}
            aria-pressed={activeBrand === brand}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
              activeBrand === brand
                ? "bg-glass-zinc text-white"
                : "bg-glass-light text-glass-muted hover:bg-glass-zinc/10"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {featured.length === 0 ? (
        <p className="mt-8 text-sm text-taupe">No {activeBrand} units currently match Excellent condition and in stock.</p>
      ) : (
        <BlurInStaggerGrid
          key={activeBrand}
          className="mt-6 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-[var(--gutter-desktop)]"
        >
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </BlurInStaggerGrid>
      )}
    </section>
  );
}
