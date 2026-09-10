import Link from "next/link";
import { brandMeta, brandSlug } from "@/lib/brand-meta";
import type { Product } from "@/lib/types";

const MAX_BRANDS = 8;

type BrandTile = { brand: string; count: number };

export function ShopByBrand({ products }: { products: Product[] }) {
  const byBrand = new Map<string, number>();
  for (const product of products) {
    byBrand.set(product.brand, (byBrand.get(product.brand) ?? 0) + 1);
  }

  const brands: BrandTile[] = Array.from(byBrand.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BRANDS)
    .map(([brand, count]) => ({ brand, count }));

  if (brands.length === 0) return null;

  return (
    <section
      aria-label="Shop by brand"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass-muted">Shop by brand</p>
      <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.02em] text-glass-zinc">
        Three brands. Every configuration.
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map(({ brand, count }) => {
          const { tagline } = brandMeta(brand);
          return (
            <Link
              key={brand}
              href={`/brands/${brandSlug(brand)}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)] transition-colors duration-300 ease-[var(--ease-glass)] hover:bg-gradient-to-br hover:from-glass-violet/[0.06] hover:to-transparent"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-medium tracking-[-0.02em] text-glass-zinc">{brand}</span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-glass-emerald opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-1 text-sm text-glass-muted">
                  {tagline} · {count} laptop{count === 1 ? "" : "s"}
                </p>
              </div>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-glass-zinc transition-colors duration-300 group-hover:text-glass-violet">
                View range
                <span className="relative inline-block w-4 overflow-hidden">
                  <span className="inline-block transition-transform duration-300 ease-[var(--ease-glass)] group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
