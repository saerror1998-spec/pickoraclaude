import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

const MAX_FEATURED = 60;

export function BestLaptops({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.condition === "Excellent" && p.inStock).slice(0, MAX_FEATURED);

  if (featured.length === 0) return null;

  return (
    <section
      aria-label="Best laptops"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] text-ink">Best laptops</h2>
        <Link href="/shop" className="shrink-0 text-sm text-accent hover:underline">
          View all laptops →
        </Link>
      </div>
      <p className="mt-2 text-sm text-taupe">Excellent-condition units, in stock and ready to ship.</p>

      <div className="mt-6 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-[var(--gutter-desktop)]">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
