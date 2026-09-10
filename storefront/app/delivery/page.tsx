import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";

const TITLE = "UAE-Wide Delivery on Refurbished Laptops | Pickora";
const DESCRIPTION =
  "Pickora ships certified refurbished laptops across the UAE — free shipping, tracked delivery, 90-day warranty on every order.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/delivery" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

export default function DeliveryPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Delivery</p>
          <h1 className="mt-3 type-headline-md text-ink">We deliver refurbished laptops across the UAE.</h1>
          <p className="mt-4 max-w-lg text-taupe">
            Free shipping on every order, no matter which emirate you&apos;re in. Once your payment is
            confirmed, we get your laptop packed and shipped, with tracking sent to your email as soon as
            it&apos;s on its way.
          </p>

          <div className="mt-10 rounded-[var(--radius-card-secondary)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-base text-ink">Coverage</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {EMIRATES.map((emirate) => (
                <li
                  key={emirate}
                  className="rounded-[var(--radius-pill)] bg-cream-warm px-4 py-2 text-sm text-ink"
                >
                  {emirate}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/warranty"
              className="rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
            >
              Read the warranty
            </Link>
            <Link
              href="/support"
              className="rounded-[var(--radius-pill)] border border-ink/15 px-6 py-2.5 text-sm font-medium text-ink transition-colors duration-200 ease-[var(--ease-expo-out)] hover:bg-ink/5"
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
