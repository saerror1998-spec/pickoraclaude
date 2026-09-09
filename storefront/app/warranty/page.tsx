import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";

export const metadata = {
  title: "Warranty — Pickora",
};

const COVERED = [
  "Battery, keyboard, trackpad, and screen defects present at delivery",
  "Hardware failures under normal use — won't power on, won't charge, drive failure",
  "Software issues tied to the original setup we shipped it with",
  "Any fault a laptop should have been caught for during our certification process",
];

const NOT_COVERED = [
  "Accidental damage — drops, spills, cracked screens after delivery",
  "Normal cosmetic wear that was already disclosed in the listing's condition grade",
  "Damage from unauthorized repairs or modifications",
  "Software, files, or accounts added after delivery",
];

export default function WarrantyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Warranty</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] text-ink">90 days, covered.</h1>
          <p className="mt-4 max-w-lg text-taupe">
            Every laptop we sell ships with a 90-day warranty on parts and workmanship, starting the
            day it arrives — no extra cost, no fine print to hunt for.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 md:gap-[var(--gutter-desktop)]">
            <div className="rounded-[var(--radius-card-secondary)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-base text-ink">What&apos;s covered</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {COVERED.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-taupe">
                    <span aria-hidden className="mt-0.5 shrink-0 text-[var(--color-save)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-card-secondary)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-base text-ink">What&apos;s not covered</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {NOT_COVERED.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-taupe">
                    <span aria-hidden className="mt-0.5 shrink-0 text-taupe-light">
                      ×
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-[var(--radius-card-secondary)] bg-cream-warm p-6">
            <h2 className="text-base text-ink">Filing a claim</h2>
            <p className="mt-2 text-sm text-taupe">
              Email support with your order reference and a description of the issue — we&apos;ll get
              back to you with next steps, whether that&apos;s a repair, a replacement, or a refund.
            </p>
            <Link
              href="/support"
              className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
            >
              Contact support
            </Link>
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
