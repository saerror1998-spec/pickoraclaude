import Link from "next/link";
import type { Product } from "@/lib/types";

const SUPPORT_EMAIL = "hello@pickoraonline.com";

function faqItems(condition: Product["condition"]) {
  return [
    {
      question: "How long does delivery take?",
      answer:
        "Shipping is free on every order. Once your payment is confirmed, we get your laptop packed and out the door, and you'll get tracking details by email as soon as it ships.",
    },
    {
      question: "What warranty comes with this laptop?",
      answer: (
        <>
          Every laptop ships with a 90-day warranty covering parts and workmanship from the day it
          arrives.{" "}
          <Link href="/warranty" className="underline underline-offset-2">
            See what&apos;s covered
          </Link>
          .
        </>
      ),
    },
    {
      question: "Is this laptop tested before shipping?",
      answer:
        "Yes. Every unit runs through a full hardware and software diagnostic, has any parts that don't meet spec replaced, gets deep cleaned, and is graded on cosmetic condition before it's listed for sale.",
    },
    {
      question: "Will I receive the exact unit shown in the photo?",
      answer: `The photo represents this model and condition grade (${condition}) rather than the individual serial unit — cosmetic wear can vary slightly within that grade, and any real defects beyond normal wear are caught during certification, not shipped to you.`,
    },
    {
      question: "What if something's wrong with my order?",
      answer: (
        <>
          Email {SUPPORT_EMAIL} with your order reference and what&apos;s wrong — we&apos;ll sort out a
          repair, replacement, or refund depending on the issue.{" "}
          <Link href="/support" className="underline underline-offset-2">
            Contact support
          </Link>
          .
        </>
      ),
    },
    {
      question: "Is payment secure?",
      answer:
        "Checkout runs through Nomod, and we accept Visa, Mastercard, Apple Pay, tabby, and tamara.",
    },
  ];
}

export function ProductInfoAccordion({ product }: { product: Product }) {
  return (
    <div className="mx-auto mt-16 max-w-[720px]">
      <details className="group border-b border-ink/10 py-6" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium uppercase tracking-[0.15em] text-ink marker:content-none">
          Shipping &amp; returns
          <span
            aria-hidden
            className="shrink-0 text-taupe-light transition-transform duration-200 ease-[var(--ease-expo-out)] group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="mt-4 flex flex-col gap-3 text-sm text-taupe">
          <p>
            Free shipping on every order, anywhere we deliver. Once payment is confirmed we get your
            laptop packed and shipped, with tracking sent to your email.
          </p>
          <p>
            Need to change or cancel an order? Email {SUPPORT_EMAIL} with your order reference as soon
            as possible — we can amend or cancel anything that hasn&apos;t shipped yet.
          </p>
          <p>
            Every laptop is covered by a{" "}
            <Link href="/warranty" className="text-ink underline underline-offset-2">
              90-day warranty
            </Link>{" "}
            on parts and workmanship. For anything else, {" "}
            <Link href="/support" className="text-ink underline underline-offset-2">
              contact support
            </Link>{" "}
            and we&apos;ll work out a repair, replacement, or refund.
          </p>
        </div>
      </details>

      <div className="pt-6">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-ink">FAQ</p>
        <div className="mt-4 flex flex-col gap-3">
          {faqItems(product.condition).map((faq) => (
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
    </div>
  );
}
