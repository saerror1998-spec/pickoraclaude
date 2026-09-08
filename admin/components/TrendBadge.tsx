import type { TrendDirection } from "@/lib/types";

const TREND_STYLES: Record<TrendDirection, { color: string; arrow: string }> = {
  up: { color: "text-positive", arrow: "↑" },
  down: { color: "text-negative", arrow: "↓" },
  flat: { color: "text-text-muted", arrow: "→" },
};

export function TrendBadge({ deltaLabel, trend }: { deltaLabel: string; trend: TrendDirection }) {
  const { color, arrow } = TREND_STYLES[trend];
  return (
    <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${color}`}>
      <span aria-hidden>{arrow}</span>
      {deltaLabel}
    </span>
  );
}
