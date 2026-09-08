import { ScrollReveal } from "./ScrollReveal";

const REASONS = [
  { title: "90-day warranty", copy: "Every laptop is covered from the day it ships." },
  { title: "Free shipping", copy: "No surprises at checkout — free shipping, always." },
  { title: "Price match", copy: "Found it cheaper elsewhere? We'll match it." },
  { title: "0% APR financing", copy: "Split your purchase over up to 24 months." },
];

export function WhyPickora() {
  return (
    <section id="why-pickora" className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] py-20 md:px-[var(--gutter-desktop)]">
      <ScrollReveal
        as="h2"
        lines={["Why buy refurbished", "on Pickora."]}
        className="text-center text-[clamp(2rem,4vw,3rem)]"
      />

      <div className="mt-12 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 md:gap-[var(--gutter-desktop)] lg:grid-cols-4">
        {REASONS.map((reason) => (
          <div
            key={reason.title}
            className="rounded-[var(--radius-card-secondary)] bg-white p-6 text-center shadow-[var(--shadow-soft)]"
          >
            <h3 className="text-base text-ink">{reason.title}</h3>
            <p className="mt-2 text-sm text-taupe">{reason.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
