import { ProductCard } from "./ProductCard";
import { getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

const MAX_OFFERS = 10;

export function BestOffers({ products }: { products: Product[] }) {
  const offers = products
    .map((product) => ({ product, savePercent: getSavePercent(product) }))
    .filter((entry): entry is { product: Product; savePercent: number } => entry.savePercent !== null)
    .sort((a, b) => b.savePercent - a.savePercent)
    .slice(0, MAX_OFFERS)
    .map((entry) => entry.product);

  if (offers.length === 0) return null;

  return (
    <section
      aria-label="Best offers"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="type-label-md text-ink">Best offers right now</h2>
        <span className="shrink-0 text-sm text-taupe">Biggest savings across the catalog</span>
      </div>

      <ul className="mt-6 flex snap-x snap-mandatory gap-[var(--gutter-mobile)] overflow-x-auto pb-2 md:gap-[var(--gutter-desktop)]">
        {offers.map((product) => (
          <li key={product.id} className="w-64 shrink-0 snap-start md:w-72">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
