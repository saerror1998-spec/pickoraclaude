import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";

const TITLE = "Support & Help Center | Pickora UAE";
const DESCRIPTION =
  "Questions about your order, warranty, or a laptop on Pickora? Get help here or WhatsApp our UAE support team directly.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/support" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const SUPPORT_EMAIL = "hello@pickoraonline.com";

const FAQS = [
  {
    question: "Where's my order?",
    answer:
      "Sign in and check your order history on your account page — every order shows its current status. You'll also get an email confirmation once payment is verified.",
    link: { href: "/account", label: "View your orders" },
  },
  {
    question: "What does the warranty cover?",
    answer:
      "Every laptop ships with a 90-day warranty covering parts and workmanship from the day it arrives. See the warranty page for the full details.",
    link: { href: "/warranty", label: "Read the warranty" },
  },
  {
    question: "How does price match work?",
    answer:
      "Found the same laptop, same condition, cheaper elsewhere? Email us the listing and we'll match it before you check out, or refund the difference within 7 days of delivery if you already bought from us.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping is free on every order. Once your payment is confirmed, we'll get your laptop packed and out the door — you'll get tracking details by email as soon as it ships.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "If a payment hasn't gone through yet, you can simply close checkout and start again. If you've already paid and need to change or cancel, email us with your order reference as soon as possible.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function SupportPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Support</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] text-ink">How can we help?</h1>
          <p className="mt-4 max-w-lg text-taupe">
            Most questions are answered below. For anything else, email us directly and we&apos;ll get
            back to you.
          </p>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ink px-6 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
          >
            Email {SUPPORT_EMAIL}
          </a>

          <div className="mt-14 flex flex-col gap-3">
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
                {faq.link && (
                  <Link href={faq.link.href} className="mt-3 inline-block text-sm text-ink underline underline-offset-2">
                    {faq.link.label}
                  </Link>
                )}
              </details>
            ))}
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
