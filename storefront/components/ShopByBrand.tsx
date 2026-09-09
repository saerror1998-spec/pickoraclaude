import Image from "next/image";
import Link from "next/link";
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
      <h2 className="type-label-md text-ink">Shop by brand</h2>

      <div className="mt-6 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 md:gap-[var(--gutter-desktop)]">
        {brands.map(({ brand, count, product }, i) => {
          const dark = i % 2 === 1;
          return (
            <Link
              key={brand}
              href={`/shop?brand=${encodeURIComponent(brand)}`}
              className={`group flex items-center gap-6 overflow-hidden rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-soft)] transition-transform duration-200 ease-[var(--ease-expo-out)] hover:-translate-y-1 sm:p-8 ${
                dark ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="block text-xl font-medium sm:text-2xl">{brand}</span>
                <span className={`mt-1 block text-sm ${dark ? "text-white/60" : "text-taupe"}`}>
                  {count} laptop{count === 1 ? "" : "s"}
                </span>
                <span
                  className={`mt-5 inline-flex items-center rounded-[var(--radius-pill)] px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                    dark ? "bg-cream text-ink group-hover:bg-white" : "bg-accent text-white group-hover:brightness-110"
                  }`}
                >
                  Shop now
                </span>
              </div>

              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-[var(--radius-card-secondary)] bg-cream-warm sm:w-32">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-300 ease-[var(--ease-expo-out)] group-hover:scale-105"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
