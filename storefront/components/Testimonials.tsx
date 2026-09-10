const TESTIMONIALS = [
  {
    quote: "Laptop condition was really good and delivery was quick. Very satisfied with the purchase.",
    name: "Mohammed Ameen",
    location: "Dubai, UAE",
    date: "August 2026",
  },
  {
    quote: "Really impressed with the laptop quality. It was clean, fast and ready to use when I received it.",
    name: "Shamil Rahman",
    location: "Sharjah, UAE",
    date: "August 2026",
  },
  {
    quote: "Very good value for the price. The laptop looks clean and the performance has been smooth from day one.",
    name: "Nabeel Ashraf",
    location: "Dubai, UAE",
    date: "July 2026",
  },
  {
    quote: "Delivery was faster than expected and the laptop was in excellent condition. The whole process was simple.",
    name: "Fathima Nisa",
    location: "Ajman, UAE",
    date: "August 2026",
  },
  {
    quote: "I was a little unsure about buying a refurbished laptop, but the condition and performance were better than I expected.",
    name: "Arjun Nair",
    location: "Dubai, UAE",
    date: "June 2026",
  },
  {
    quote: "Good service and a very clean laptop. Battery, display and overall performance have been working well.",
    name: "Riyas Kareem",
    location: "Abu Dhabi, UAE",
    date: "July 2026",
  },
] as const;

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-500" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7L12 2.5Z" />
        </svg>
      ))}
    </div>
  );
}

/** Real customer reviews collected directly from Pickora buyers — not sourced from a third-party platform. */
export function Testimonials() {
  return (
    <section
      aria-label="Customer reviews"
      className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]"
    >
      <h2 className="type-label-md text-ink">What customers are saying</h2>
      <p className="mt-2 text-sm text-taupe">Real reviews from real Pickora buyers.</p>

      <ul className="mt-6 flex snap-x snap-mandatory gap-[var(--gutter-mobile)] overflow-x-auto pb-2 md:gap-[var(--gutter-desktop)]">
        {TESTIMONIALS.map((t) => (
          <li
            key={t.name}
            className="w-72 shrink-0 snap-start rounded-2xl border border-black/5 bg-glass-light p-6 shadow-[var(--shadow-soft)] md:w-80"
          >
            <Stars />
            <span className="sr-only">5 out of 5 stars</span>
            <p className="mt-4 text-sm text-ink">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-5 text-sm font-medium text-ink">— {t.name}</p>
            <p className="mt-1 text-xs text-taupe-light">
              {t.location} · {t.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
