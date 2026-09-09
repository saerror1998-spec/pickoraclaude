import Image from "next/image";
import Link from "next/link";
import { WaveReveal } from "./WaveReveal";
import { formatPrice, getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Luxury split hero: real copy + CTAs on the left, a real featured product
 * photo on the right in a tilted, layered card — not a generic app/SaaS
 * dashboard mockup (which is what this was adapted from). Falls back to a
 * plain badge card when no product is available (e.g. the product-load
 * error path), rather than showing a broken image.
 */
export function Hero({ product }: { product?: Product }) {
  const savePercent = product ? getSavePercent(product) : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream to-cream-warm">
      <div className="mx-auto flex max-w-[1400px] flex-col-reverse items-center gap-16 px-[var(--gutter-mobile)] py-20 md:px-[var(--gutter-desktop)] md:py-28 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-16 xl:px-24">
        {/* Copy */}
        <div className="max-w-xl text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Certified refurbished</p>

          <h1 className="mt-4 text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] text-ink">
            <WaveReveal as="span" className="block" text="Ask more of" direction="up" />
            <WaveReveal as="span" className="block" text="your laptop." direction="up" delay={250} />
          </h1>

          <p className="mt-6 text-balance text-[clamp(1rem,1.5vw,1.25rem)] text-taupe">
            Premium laptops, professionally inspected, restored, and warrantied — at up to 40%
            off retail.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/shop"
              className="rounded-[var(--radius-pill)] bg-ink px-8 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-105"
            >
              Explore Laptops
            </Link>
            <Link
              href="/warranty"
              className="rounded-[var(--radius-pill)] border border-ink/15 px-8 py-3 text-sm font-medium text-ink transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-ink/5"
            >
              Learn about our warranty
            </Link>
          </div>
        </div>

        {/* Product showcase */}
        <div className="relative mx-auto w-full max-w-sm shrink-0 lg:mx-0">
          {/* Stacked layers behind the card, for depth — Pickora's own tones. */}
          <div aria-hidden className="absolute -left-4 -top-4 h-full w-full rotate-6 rounded-[var(--radius-card)] bg-ink/10" />
          <div aria-hidden className="absolute -left-8 -top-8 h-full w-full rotate-12 rounded-[var(--radius-card)] bg-accent/10" />

          {product ? (
            <Link
              href={`/products/${product.slug}`}
              className="group relative block rotate-2 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-deep)] transition-transform duration-300 hover:rotate-1"
            >
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card-secondary)] bg-cream-warm">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 384px, 80vw"
                  className="object-cover transition-transform duration-300 ease-[var(--ease-expo-out)] group-hover:scale-105"
                  priority
                />
                {savePercent !== null && (
                  <span className="absolute left-3 top-3 rounded-[var(--radius-pill)] bg-[var(--color-save)] px-3 py-1 text-xs font-medium text-white">
                    Save {savePercent}%
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.1em] text-taupe-light">{product.brand}</p>
                <p className="mt-1 truncate text-base text-ink">{product.name}</p>
                <div className="mt-1 flex items-center gap-2 tabular-nums">
                  <span className="text-lg text-ink">{formatPrice(product.priceCents)}</span>
                  {product.originalPriceCents && (
                    <span className="text-sm text-taupe-light line-through">
                      {formatPrice(product.originalPriceCents)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative flex aspect-square rotate-2 items-center justify-center rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-deep)]">
              <p className="text-taupe">Certified refurbished laptops</p>
            </div>
          )}

          {/* Floating badge — real claim, not a fabricated app-mockup element. */}
          <div className="absolute -bottom-6 -right-4 flex items-center gap-3 rounded-[var(--radius-card-secondary)] bg-ink px-5 py-4 shadow-[var(--shadow-deep)] md:-right-8">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-white">
              <path
                d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-white">Certified refurbished</p>
              <p className="text-xs text-white/60">90-day warranty included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
