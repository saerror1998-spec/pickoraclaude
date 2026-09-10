import Link from "next/link";

import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";

const TITLE = "How Our Certification Process Works | Pickora UAE";
const DESCRIPTION =
  "Every Pickora laptop passes a 4-step certification: diagnose, repair & replace, deep clean, grade & certify. See exactly what \"factory refurbished\" means here.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/certification" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const STEPS = [
  {
    step: "01",
    title: "Diagnose",
    copy: "Every unit runs through a full hardware and software diagnostic before anything else happens — CPU, RAM, storage, battery health, screen, keyboard, ports, and Wi-Fi are all checked against spec.",
  },
  {
    step: "02",
    title: "Repair & replace",
    copy: "Batteries, keyboards, screens, and drives that don't meet spec are replaced with quality parts. A laptop doesn't move to the next step until it actually works the way it should.",
  },
  {
    step: "03",
    title: "Deep clean",
    copy: "Chassis, ports, and internals are cleaned so every laptop looks and feels genuinely refreshed — not just wiped down cosmetically.",
  },
  {
    step: "04",
    title: "Grade & certify",
    copy: "A final pass grades cosmetic condition (Excellent, Good, or Fair) and confirms performance one more time before the laptop is listed for sale.",
  },
] as const;

const FAQS = [
  {
    question: "What does \"factory refurbished\" mean at Pickora?",
    answer:
      "It means every laptop went through this exact 4-step process — diagnosed, repaired where needed, deep cleaned, and graded — before it was allowed to be listed. It's not just a cosmetic wipe-down.",
  },
  {
    question: "Do all laptops pass certification?",
    answer:
      "Only units that pass diagnosis and repair make it to listing. The cosmetic condition grade (Excellent, Good, or Fair) reflects what's found at the grading step, so you know what to expect before you buy.",
  },
  {
    question: "How does this relate to the warranty?",
    answer:
      "Certification is what happens before a laptop is listed; the 90-day warranty is what happens after you buy it. Both exist for the same reason — so a defect that slips through gets caught and fixed.",
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

const HOWTO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: TITLE,
  description: DESCRIPTION,
  step: STEPS.map((s) => ({
    "@type": "HowToStep",
    position: Number(s.step),
    name: s.title,
    text: s.copy,
  })),
};

export default function CertificationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSON_LD) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Certification</p>
          <h1 className="mt-3 type-headline-md text-ink">How every Pickora laptop is certified.</h1>
          <p className="mt-4 max-w-lg text-taupe">
            The same four steps, on every single laptop, before it&apos;s allowed on the shelf.
          </p>

          <ol className="mt-12 flex flex-col gap-6">
            {STEPS.map((item) => (
              <li key={item.step} className="rounded-[var(--radius-card-secondary)] bg-white p-6 shadow-[var(--shadow-soft)]">
                <span className="text-sm text-taupe-light">{item.step}</span>
                <h2 className="mt-2 text-lg text-ink">{item.title}</h2>
                <p className="mt-2 text-sm text-taupe">{item.copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col gap-3">
            <h2 className="type-label-md text-ink">FAQ</h2>
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group mt-2 rounded-[var(--radius-card-secondary)] bg-white p-5 shadow-[var(--shadow-soft)] open:pb-6"
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

          <div className="mt-12 rounded-[var(--radius-card-secondary)] bg-cream-warm p-6">
            <p className="text-sm text-taupe">
              Every certified laptop also ships with a 90-day warranty covering parts and workmanship.
            </p>
            <Link
              href="/warranty"
              className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
            >
              Read the warranty
            </Link>
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
