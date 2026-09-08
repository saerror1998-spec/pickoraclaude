const STATUS_STYLES: Record<string, string> = {
  paid: "bg-positive/10 text-positive",
  pending: "bg-warning/10 text-warning",
  enabled: "bg-warning/10 text-warning", // Nomod's real "awaiting payment" status (see README)
  created: "bg-warning/10 text-warning",
  cancelled: "bg-negative/10 text-negative",
  expired: "bg-negative/10 text-negative",
  failed: "bg-negative/10 text-negative",
  refunded: "bg-text-faint/10 text-text-faint",
};

const STATUS_LABELS: Record<string, string> = {
  enabled: "awaiting payment",
  created: "awaiting payment",
};

export function StatusBadge({ status }: { status: string }) {
  const className = STATUS_STYLES[status] ?? "bg-text-faint/10 text-text-faint";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs capitalize ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
