import Image from "next/image";
import Link from "next/link";
import { formatPrice, getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const savePercent = getSavePercent(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-soft)] transition-transform duration-[250ms] ease-[var(--ease-expo-out)] hover:-translate-y-1 hover:scale-[1.02] focus-visible:-translate-y-1"
      aria-label={`${product.name}, ${formatPrice(product.priceCents)}${!product.inStock ? ", out of stock" : ""}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[calc(var(--radius-card)-10px)] bg-cream-warm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1051px) 25vw, (min-width: 761px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 ease-[var(--ease-expo-out)] group-hover:scale-105"
        />
        {savePercent !== null && (
          <span className="absolute left-3 top-3 rounded-[var(--radius-pill)] bg-[var(--color-save)] px-3 py-1 text-xs font-medium text-white">
            Save {savePercent}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-ink/80 px-3 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-base text-ink">{product.name}</h3>
        <p className="mt-1 text-sm text-taupe">
          {product.specText || `${product.processor} · ${product.ramGb}GB · ${product.storageGb}GB`}
        </p>

        <div className="mt-2 flex items-center justify-center gap-2 tabular-nums">
          <span className="text-base text-ink">{formatPrice(product.priceCents)}</span>
          {product.originalPriceCents && (
            <span className="text-sm text-taupe-light line-through">
              {formatPrice(product.originalPriceCents)}
            </span>
          )}
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
          View details
          <span className="relative inline-block w-4 overflow-hidden">
            <span className="inline-block transition-transform duration-[220ms] ease-[var(--ease-expo-out)] group-hover:translate-x-1">
              →
            </span>
          </span>
        </span>
      </div>
    </Link>
  );
}
