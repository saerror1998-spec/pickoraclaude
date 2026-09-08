import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center px-[var(--gutter-mobile)] py-24 text-center md:px-[var(--gutter-desktop)] md:py-32">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/60">
          Certified refurbished
        </p>

        <ScrollReveal
          as="h1"
          lines={["Ask more of", "your laptop."]}
          className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-white"
          immediate
        />

        <p className="mt-6 max-w-xl text-balance text-[clamp(1rem,1.5vw,1.25rem)] text-white/70">
          Premium laptops, professionally inspected, restored, and warrantied —
          at up to 40% off retail.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/#catalog"
            className="rounded-[var(--radius-pill)] bg-white px-8 py-3 text-sm font-medium text-ink transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-105"
          >
            Explore Laptops
          </Link>
          <Link
            href="/warranty"
            className="rounded-[var(--radius-pill)] border border-white/30 px-8 py-3 text-sm font-medium text-white transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-white/10"
          >
            Learn about our warranty
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent"
      />
    </section>
  );
}
