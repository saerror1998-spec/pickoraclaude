"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { formatPrice, getSavePercent } from "@/lib/products";
import { useWishlist } from "./WishlistProvider";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const savePercent = getSavePercent(product);
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleWishlistClick(e: MouseEvent) {
    e.preventDefault();
    toggleItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      priceCents: product.priceCents,
    });
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur-sm transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-110"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} aria-hidden="true">
          <path
            d="M12 20.5s-7.5-4.6-9.9-9.1C.5 8.1 1.9 4.5 5.4 3.6c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2 3.5.9 4.9 4.5 3.3 7.8C19.5 15.9 12 20.5 12 20.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Link
        href={`/products/${product.slug}`}
        className="block rounded-[var(--radius-card)] border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)] transition-transform duration-[250ms] ease-[var(--ease-expo-out)] hover:-translate-y-1 hover:scale-[1.02] focus-visible:-translate-y-1"
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
            <span className="absolute left-3 top-3 rounded-[var(--radius-pill)] bg-glass-emerald px-3 py-1 text-xs font-medium text-white">
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
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-glass-muted">{product.brand}</p>
        <h3 className="mt-1 text-base text-ink">{product.name}</h3>
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
          View product
          <span className="relative inline-block w-4 overflow-hidden">
            <span className="inline-block transition-transform duration-[220ms] ease-[var(--ease-expo-out)] group-hover:translate-x-1">
              →
            </span>
          </span>
        </span>
      </div>
      </Link>
    </div>
  );
}
