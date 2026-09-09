import { cn } from "@/lib/utils";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Apple Pay", "tabby", "tamara"] as const;

/**
 * Real, currently-live payment methods on the Nomod checkout (confirmed
 * against the Nomod merchant dashboard) — not a generic "we accept
 * everything" badge row.
 */
export function PaymentBadges({ badgeClassName = "" }: { badgeClassName?: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      {PAYMENT_METHODS.map((method) => (
        <li
          key={method}
          className={cn(
            "rounded-[var(--radius-pill)] border border-taupe-light/30 bg-white px-3 py-1 text-xs font-medium text-taupe",
            badgeClassName
          )}
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
