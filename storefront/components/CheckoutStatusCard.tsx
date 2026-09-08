import Link from "next/link";
import type { ReactNode } from "react";

export function CheckoutStatusCard({
  icon,
  title,
  message,
  referenceId,
  primaryAction,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  referenceId?: string;
  primaryAction: { href: string; label: string };
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream-warm text-2xl">
          {icon}
        </div>
        <h1 className="text-xl text-ink">{title}</h1>
        <p className="mt-2 text-sm text-taupe">{message}</p>
        {referenceId && (
          <p className="mt-4 text-xs tabular-nums text-taupe-light">Order reference: {referenceId}</p>
        )}
        <Link
          href={primaryAction.href}
          className="mt-6 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
        >
          {primaryAction.label}
        </Link>
      </div>
    </main>
  );
}
