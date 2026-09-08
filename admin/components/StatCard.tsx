import { Card } from "./Card";
import { TrendBadge } from "./TrendBadge";
import type { StatSummary } from "@/lib/types";

export function StatCard({ stat }: { stat: StatSummary }) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-text-muted">{stat.label}</span>
      <span className="text-2xl tabular-nums text-text">{stat.value}</span>
      <TrendBadge deltaLabel={stat.deltaLabel} trend={stat.trend} />
    </Card>
  );
}
