import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

const WHATSAPP_NUMBER = "971524078652";
const WHATSAPP_MESSAGE = "Hi, I'm looking for a laptop and could use some help choosing.";

/** A real, currently in-stock product photo for the banner — not a stock lifestyle image. */
function pickShowcaseProduct(products: Product[]): Product | undefined {
  const inStock = products.filter((p) => p.inStock);
  return inStock[Math.floor(inStock.length / 2)] ?? inStock[0];
}

export function CTABanner({ products }: { products: Product[] }) {
  const product = pickShowcaseProduct(products);
  if (!product) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]">
      <div className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-section-mobile)] bg-gradient-to-br from-glass-light to-white md:grid-cols-2 md:rounded-[var(--radius-section)]">
        <div className="flex flex-col justify-center px-8 py-12 md:px-12">
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-glass-zinc">
            Ready to find your next laptop?
          </h2>
          <p className="mt-4 max-w-md text-sm text-glass-muted">
            Browse the full catalog, or message us directly if you&apos;d rather talk through what fits
            your budget and use case.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-glass-zinc px-6 py-3 text-sm font-medium text-white transition-transform duration-300 ease-[var(--ease-glass)] hover:scale-105"
            >
              Shop Laptops
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-glass-zinc transition-colors duration-300 hover:bg-black/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.4 5.12L2 22l5.14-1.5a9.85 9.85 0 0 0 4.9 1.32h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full md:aspect-auto">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
