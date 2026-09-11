/**
 * Honest placeholder for an account section with no real data behind it yet
 * (no saved-address book, no stored payment methods — Nomod's hosted
 * checkout collects both fresh every time and we never see or store them).
 * Same pattern as the admin panel's NotConnectedCard — no fabricated data.
 */
export function AccountEmptySection({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
      <h2 className="text-lg text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-taupe">{description}</p>
    </div>
  );
}
