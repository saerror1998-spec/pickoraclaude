import Link from "next/link";
import type { Product } from "@/lib/types";

const MAX_BRANDS = 8;

export function ShopByBrand({ products }: { products: Product[] }) {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  }

  const brands = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BRANDS);

  if (brands.length === 0) return null;

  return (
    <section
      aria-label="Shop by brand"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] text-ink">Shop by brand</h2>

      <div className="mt-6 grid grid-cols-2 gap-[var(--gutter-mobile)] sm:grid-cols-4 md:gap-[var(--gutter-desktop)]">
        {brands.map(([brand, count]) => (
          <Link
            key={brand}
            href={`/?brand=${encodeURIComponent(brand)}#catalog`}
            className="rounded-[var(--radius-card-secondary)] bg-white p-6 text-center shadow-[var(--shadow-soft)] transition-transform duration-200 ease-[var(--ease-expo-out)] hover:-translate-y-1"
          >
            <span className="block text-base text-ink">{brand}</span>
            <span className="mt-1 block text-sm text-taupe">
              {count} laptop{count === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
