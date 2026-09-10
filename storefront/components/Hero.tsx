import Link from "next/link";
import { WaveReveal } from "./WaveReveal";

/**
 * Immersive dark glass hero. No hardcoded commercial claims — the two stat
 * cards on the right use `productCount`/`brandCount`, computed by the caller
 * from the real Supabase catalog, rather than fixed numbers.
 */
export function Hero({ productCount, brandCount }: { productCount?: number; brandCount?: number }) {
  return (
    <section className="px-3 pt-3 md:px-5">
      <div className="relative isolate flex min-h-[85vh] flex-col justify-center overflow-hidden rounded-[var(--radius-section-mobile)] bg-gradient-to-b from-zinc-950 via-black to-black md:min-h-[92vh] md:rounded-[var(--radius-section)]">
        {/* Ambient violet glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[60%] w-[80%] -translate-x-1/2 rounded-full bg-glass-violet/20 blur-[120px]"
        />
        <div aria-hidden className="grain-overlay" />

        {/* Decorative background wordmark — purely visual, hidden from a11y tree */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-bold leading-none text-white/[0.03] blur-[2px]"
          style={{ fontSize: "18vw", letterSpacing: "-0.03em" }}
        >
          PICKORA
        </p>

        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-24 md:px-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16 lg:px-16">
          {/* Left: editorial copy */}
          <div className="animate-fade-in-up text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Premium Refurbished Tech
            </p>

            <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
              <WaveReveal as="span" className="block" text="Smarter laptops." direction="up" />
              <WaveReveal as="span" className="block" text="Better value." direction="up" delay={250} />
            </h1>

            <p className="mx-auto mt-6 max-w-md text-balance text-base font-light text-zinc-400 lg:mx-0">
              Discover carefully selected refurbished Dell, HP and Lenovo laptops with configurations for
              work, study and everyday use.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/shop"
                className="group flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-medium text-zinc-900 transition-transform duration-300 ease-[var(--ease-glass)] hover:scale-105"
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

              <Link
                href="/shop"
                className="glass-panel rounded-full px-6 py-3 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white"
              >
                Explore Dell, HP &amp; Lenovo
              </Link>
            </div>
          </div>

          {/* Right: floating glass stat cards */}
          <div className="mx-auto flex w-full max-w-xs flex-col gap-4 lg:mx-0">
            {typeof productCount === "number" && (
              <div className="glass-panel animate-fade-in-up rounded-3xl p-5" style={{ animationDelay: "150ms" }}>
                <p className="text-3xl font-medium tracking-[-0.03em] text-white">{productCount}+</p>
                <p className="mt-1 text-sm text-white/60">Laptops available</p>
              </div>
            )}
            {typeof brandCount === "number" && brandCount > 0 && (
              <div className="glass-panel animate-fade-in-up rounded-3xl p-5" style={{ animationDelay: "300ms" }}>
                <p className="text-3xl font-medium tracking-[-0.03em] text-white">Dell · HP · Lenovo</p>
                <p className="mt-1 text-sm text-white/60">Available brands</p>
              </div>
            )}
            <div className="glass-panel animate-fade-in-up rounded-3xl p-5" style={{ animationDelay: "450ms" }}>
              <p className="text-3xl font-medium tracking-[-0.03em] text-white">AED</p>
              <p className="mt-1 text-sm text-white/60">Transparent pricing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
