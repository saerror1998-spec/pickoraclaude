import Image from "next/image";
import Link from "next/link";
import { ShowAllToggle } from "./ShowAllToggle";
import { sortProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

const MAX_ITEMS = 6;

/**
 * The reference design calls this section "Just for You" — genuine
 * per-user personalization. This store has no recommendation engine or
 * browsing-history tracking, so labeling it that way would be a false
 * claim. Named honestly instead; still real products (newest additions to
 * the catalog), just not personalized to the viewer.
 */
export function MoreToExplore({ products }: { products: Product[] }) {
  const items = sortProducts(
    products.filter((p) => p.inStock),
    "newest"
  ).slice(0, MAX_ITEMS);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass-muted">New arrivals</p>
          <h2 className="mt-2 text-[clamp(1.5rem,2.5vw,2rem)] font-medium tracking-[-0.02em] text-glass-zinc">
            More to explore
          </h2>
        </div>
        <ShowAllToggle href="/shop" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 16vw, 33vw"
                className="object-contain p-3 transition-transform duration-300 ease-[var(--ease-glass)] group-hover:scale-105"
              />
            </div>
            <p className="mt-2 truncate text-xs text-glass-muted">{product.brand}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
