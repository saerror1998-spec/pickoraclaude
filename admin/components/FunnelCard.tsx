import { Card } from "./Card";
import { formatCompactNumber } from "@/lib/format";
import type { FunnelStage } from "@/lib/types";

/**
 * Custom funnel visualization (bars sized proportionally to the first
 * stage) rather than recharts' Funnel — simpler to reason about and style
 * consistently with the rest of the dashboard.
 */
export function FunnelCard({ stages }: { stages: FunnelStage[] }) {
  const maxCount = stages[0]?.count ?? 1;

  return (
    <Card>
      <p className="mb-5 text-sm text-text-muted">Orders from 72K views · Last 30 days</p>
      <div className="flex flex-col gap-4">
        {stages.map((stage) => {
          const widthPercent = Math.max(8, (stage.count / maxCount) * 100);
          return (
            <div key={stage.stage}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="tabular-nums text-text">{formatCompactNumber(stage.count)}</span>
                {stage.percentOfPrevious !== null && (
                  <span className="rounded-[var(--radius-pill)] bg-bg px-2 py-0.5 text-xs tabular-nums text-text-muted">
                    {stage.percentOfPrevious}%
                  </span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[var(--ease-expo-out)]"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="mt-1 block text-xs text-text-faint">{stage.stage}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
