import { ProductCard } from "./ProductCard";
import { ShowAllToggle } from "./ShowAllToggle";
import { BlurInStaggerGrid } from "./BlurInStaggerGrid";
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
      aria-label="Today's best deals"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="type-label-md text-ink">Today&apos;s Best Deals</h2>
          <p className="mt-1 text-sm text-taupe">Biggest savings across the catalog</p>
        </div>
        <ShowAllToggle href="/shop" />
      </div>

      <BlurInStaggerGrid
        as="ul"
        className="mt-6 flex snap-x snap-mandatory gap-[var(--gutter-mobile)] overflow-x-auto pb-2 md:gap-[var(--gutter-desktop)]"
        itemClassName="w-64 shrink-0 snap-start md:w-72"
      >
        {offers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </BlurInStaggerGrid>
    </section>
  );
}
