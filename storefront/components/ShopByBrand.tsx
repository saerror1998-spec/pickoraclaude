import Image from "next/image";
import Link from "next/link";
import { brandSlug } from "@/lib/brand-meta";
import type { Product } from "@/lib/types";

const MAX_BRANDS = 8;

type BrandTile = { brand: string; count: number; product: Product };

/** Cheapest in-stock unit for the tile's product shot — falls back to the cheapest overall if none are in stock. */
function pickRepresentativeProduct(products: Product[]): Product {
  const inStock = products.filter((p) => p.inStock);
  const pool = inStock.length > 0 ? inStock : products;
  return [...pool].sort((a, b) => a.priceCents - b.priceCents)[0];
}

export function ShopByBrand({ products }: { products: Product[] }) {
  const byBrand = new Map<string, Product[]>();
  for (const product of products) {
    const list = byBrand.get(product.brand);
    if (list) list.push(product);
    else byBrand.set(product.brand, [product]);
  }

  const brands: BrandTile[] = Array.from(byBrand.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_BRANDS)
    .map(([brand, list]) => ({ brand, count: list.length, product: pickRepresentativeProduct(list) }));

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
        {brands.map(({ brand, count, product }) => (
          <Link
            key={brand}
            href={`/brands/${brandSlug(brand)}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)] transition-transform duration-300 ease-[var(--ease-glass)] hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-glass-light">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 ease-[var(--ease-glass)] group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="flex items-center justify-between gap-4 p-6">
              <div className="min-w-0">
                <span className="block text-xl font-medium tracking-[-0.02em] text-glass-zinc">{brand}</span>
                <span className="mt-1 block text-sm text-glass-muted">
                  {count} laptop{count === 1 ? "" : "s"}
                </span>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-glass-zinc text-white transition-colors duration-300 group-hover:bg-glass-violet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
