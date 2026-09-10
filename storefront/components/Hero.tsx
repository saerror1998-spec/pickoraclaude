import Image from "next/image";
import Link from "next/link";
import { WaveReveal } from "./WaveReveal";
import { formatPrice, getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Dark navy hero: giant low-opacity "PICKORA" wordmark as a decorative
 * background layer, a tilted ribbon badge, editorial copy + pill CTA on the
 * left, and a floating white deal card showing one real discounted product
 * (the biggest genuine discount in stock) on the right.
 */
export function Hero({ product }: { product?: Product }) {
  const savePercent = product ? getSavePercent(product) : null;

  return (
    <section className="px-3 pt-3 md:px-5">
      <div className="relative isolate flex min-h-[75vh] flex-col justify-center overflow-hidden rounded-[var(--radius-section-mobile)] bg-gradient-to-b from-zinc-950 via-black to-black md:min-h-[82vh] md:rounded-[var(--radius-section)]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[60%] w-[80%] -translate-x-1/2 rounded-full bg-glass-violet/20 blur-[120px]"
        />
        <div aria-hidden className="grain-overlay" />

        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-bold leading-none text-white/[0.04] blur-[2px]"
          style={{ fontSize: "18vw", letterSpacing: "-0.03em" }}
        >
          PICKORA
        </p>

        {/* Tilted ribbon badge */}
        <div
          aria-hidden
          className="absolute right-6 top-8 z-10 rotate-6 rounded-full bg-glass-emerald px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-glass-dark shadow-lg md:right-12 md:top-12"
        >
          0% APR available
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-12 px-6 py-16 md:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-16 lg:py-20">
          {/* Left: editorial copy + pill CTA */}
          <div className="text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Premium Refurbished Tech
            </p>

            <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
              <WaveReveal as="span" className="block" text="Smarter laptops." direction="up" />
              <WaveReveal as="span" className="block" text="Better value." direction="up" delay={250} />
            </h1>

            <p className="mx-auto mt-6 max-w-md text-balance text-base font-light text-zinc-400 lg:mx-0">
              Discover carefully selected refurbished Dell, HP and Lenovo laptops with configurations for
              work, study and everyday use.
            </p>

            <div className="mt-8">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-medium text-zinc-900 transition-transform duration-300 ease-[var(--ease-glass)] hover:scale-105"
              >
                Shop Laptops
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors duration-300 group-hover:bg-zinc-700">
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
              </Link>
            </div>
          </div>

          {/* Right: floating white deal card with one real discounted product */}
          {product && (
            <Link
              href={`/products/${product.slug}`}
              className="group mx-auto block w-full max-w-xs animate-fade-in-up rounded-3xl bg-white p-4 shadow-2xl transition-transform duration-300 ease-[var(--ease-glass)] hover:-translate-y-1 lg:mx-0 lg:ml-auto"
              style={{ animationDelay: "200ms" }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-glass-light">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {savePercent !== null && (
                  <span className="absolute left-3 top-3 rounded-full bg-glass-emerald px-3 py-1 text-xs font-medium text-white">
                    Save {savePercent}%
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-glass-muted">{product.brand}</p>
                <p className="mt-1 truncate text-sm font-medium text-glass-zinc">{product.name}</p>
                <div className="mt-1 flex items-center gap-2 tabular-nums">
                  <span className="text-base font-medium text-glass-zinc">{formatPrice(product.priceCents)}</span>
                  {product.originalPriceCents && (
                    <span className="text-sm text-taupe-light line-through">
                      {formatPrice(product.originalPriceCents)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
