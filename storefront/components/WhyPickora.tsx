import { ScrollReveal } from "./ScrollReveal";

const REASONS = [
  {
    title: "90-day warranty",
    copy: "Every laptop is covered from the day it ships.",
    icon: (
      <path
        d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Free shipping",
    copy: "No surprises at checkout — free shipping, always.",
    icon: (
      <path
        d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Price match",
    copy: "Found it cheaper elsewhere? We'll match it.",
    icon: (
      <path
        d="M4 12a8 8 0 1 1 8 8 M4 12l3-3 M4 12l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "0% APR financing",
    copy: "Split your purchase over up to 24 months.",
    icon: (
      <path
        d="M3 8h18M3 8v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8M3 8l2-4h14l2 4M7 15h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Diagnose",
    copy: "Every unit runs through a full hardware and software diagnostic before anything else happens.",
  },
  {
    step: "02",
    title: "Repair & replace",
    copy: "Batteries, keyboards, screens, and drives that don't meet spec are replaced with quality parts.",
  },
  {
    step: "03",
    title: "Deep clean",
    copy: "Chassis, ports, and internals are cleaned so every laptop looks and feels genuinely refreshed.",
  },
  {
    step: "04",
    title: "Grade & certify",
    copy: "A final pass grades cosmetic condition and confirms performance before it's listed for sale.",
  },
];

const COMPARE_ROWS = [
  { label: "Price vs. retail", refurbished: "Up to 40% less", brandNew: "Full retail price" },
  { label: "Functional testing", refurbished: "Every unit inspected", brandNew: "Factory sealed, untested by us" },
  { label: "Warranty", refurbished: "90 days included", brandNew: "Manufacturer warranty only" },
  { label: "Environmental impact", refurbished: "Extends a device's life", brandNew: "New manufacturing footprint" },
];

export function WhyPickora() {
  return (
    <section id="why-pickora" className="bg-glass-light px-3 py-20 md:px-5">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-glass-muted">
          Built for smarter laptop shopping
        </p>
        <ScrollReveal
          as="h2"
          lines={["Why buy refurbished", "on Pickora."]}
          className="mt-3 text-center text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-glass-zinc"
        />
        <p className="mx-auto mt-4 max-w-lg text-balance text-center text-glass-muted">
          Every laptop is inspected, restored, and backed by a real warranty — so &ldquo;refurbished&rdquo;
          means dependable, not risky.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-[var(--shadow-soft)] transition-transform duration-300 ease-[var(--ease-glass)] hover:-translate-y-1"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-glass-light text-glass-zinc">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {reason.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-base text-glass-zinc">{reason.title}</h3>
              <p className="mt-2 text-sm text-glass-muted">{reason.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="text-center text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.02em] text-glass-zinc">
            Our certification process
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-balance text-center text-glass-muted">
            The same four steps, on every single laptop, before it&apos;s allowed on the shelf.
          </p>

          <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item) => (
              <li key={item.step} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
                <span className="text-sm text-glass-muted">{item.step}</span>
                <h4 className="mt-2 text-base text-glass-zinc">{item.title}</h4>
                <p className="mt-2 text-sm text-glass-muted">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative mt-20 overflow-hidden rounded-[var(--radius-section-mobile)] bg-glass-dark text-white shadow-[var(--shadow-deep)] md:rounded-[var(--radius-section)]">
          <div aria-hidden className="grain-overlay" />
          <div className="relative grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-glass-dark p-6 text-sm text-white/60 sm:col-span-1">Refurbished vs. brand new</div>
            <div className="bg-glass-dark p-6 text-sm font-medium text-white sm:col-span-1">Pickora refurbished</div>
            <div className="bg-glass-dark p-6 text-sm font-medium text-white/70 sm:col-span-1">Buying new</div>
          </div>
          {COMPARE_ROWS.map((row) => (
            <div key={row.label} className="relative grid grid-cols-1 gap-px border-t border-white/10 sm:grid-cols-3">
              <div className="p-6 text-sm text-white/60 sm:col-span-1">{row.label}</div>
              <div className="p-6 text-sm text-white sm:col-span-1">{row.refurbished}</div>
              <div className="p-6 text-sm text-white/50 sm:col-span-1">{row.brandNew}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
