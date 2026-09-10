import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

const FAQS = [
  {
    question: "Is a 90-day warranty enough?",
    answer:
      "It covers parts and workmanship from the day your laptop arrives — battery, keyboard, trackpad, screen, and any hardware fault a proper inspection should have caught. Most real defects on a refurbished unit show up in the first few weeks of use, which is exactly when the warranty is active.",
  },
  {
    question: "What does \"Certified Refurbished\" mean at Pickora?",
    answer:
      "Every laptop goes through the same four steps before it's listed: a full hardware and software diagnostic, replacement of any part that doesn't meet spec, a deep clean, and a final cosmetic condition grade. Nothing goes up for sale until it clears all four.",
  },
  {
    question: "Can I pay in installments?",
    answer: "Yes — 0% APR financing with tabby or tamara, split over up to 24 months, at checkout.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

/** Real per-brand starting price, computed from the live catalog (not a fabricated range). */
function brandStartingPrices(products: Product[]): { brand: string; fromCents: number; count: number }[] {
  const byBrand = new Map<string, { min: number; count: number }>();
  for (const product of products) {
    if (!product.inStock) continue;
    const current = byBrand.get(product.brand);
    if (current) {
      current.min = Math.min(current.min, product.priceCents);
      current.count += 1;
    } else {
      byBrand.set(product.brand, { min: product.priceCents, count: 1 });
    }
  }
  return Array.from(byBrand.entries())
    .map(([brand, v]) => ({ brand, fromCents: v.min, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

export function HomepageBuyersGuide({ products }: { products: Product[] }) {
  const brandPrices = brandStartingPrices(products);
  const overallMin = products.filter((p) => p.inStock).reduce(
    (min, p) => Math.min(min, p.priceCents),
    Infinity
  );

  return (
    <section
      aria-label="Refurbished laptop buyer's guide"
      className="mx-auto max-w-[900px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      <p className="text-taupe">
        Pickora sells certified refurbished laptops in Dubai and across the UAE — real inspected,
        cleaned, and warrantied machines, not a gamble on a random used laptop. Every unit runs
        through the same certification process before it&apos;s listed, whether it&apos;s a budget
        Chromebook or a business-grade laptop.
      </p>

      {brandPrices.length > 0 && (
        <div className="mt-8">
          <h2 className="type-label-md text-ink">How much do refurbished laptops cost in the UAE?</h2>
          <p className="mt-2 text-sm text-taupe">
            Real starting prices from our current catalog{isFinite(overallMin) ? `, from ${formatPrice(overallMin)}` : ""}.
          </p>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-card-secondary)] bg-white shadow-[var(--shadow-soft)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-taupe-light">
                  <th className="px-5 py-3 font-normal">Brand</th>
                  <th className="px-5 py-3 font-normal">In stock</th>
                  <th className="px-5 py-3 text-right font-normal">Starting from</th>
                </tr>
              </thead>
              <tbody>
                {brandPrices.map((row) => (
                  <tr key={row.brand} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3 text-ink">{row.brand}</td>
                    <td className="px-5 py-3 text-taupe">{row.count} laptops</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">
                      <Link href={`/shop?brand=${encodeURIComponent(row.brand)}`} className="hover:underline">
                        {formatPrice(row.fromCents)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="type-label-md text-ink">Buyer&apos;s guide FAQ</h2>
        <div className="mt-4 flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[var(--radius-card-secondary)] bg-white p-5 shadow-[var(--shadow-soft)] open:pb-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base text-ink marker:content-none">
                {faq.question}
                <span
                  aria-hidden
                  className="shrink-0 text-taupe-light transition-transform duration-200 ease-[var(--ease-expo-out)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-taupe">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
