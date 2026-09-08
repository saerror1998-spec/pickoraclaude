"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "./Card";
import type { TrafficSource } from "@/lib/types";

const SLICE_COLORS = [
  "var(--color-text)",
  "var(--color-text-muted)",
  "var(--color-accent)",
  "var(--color-positive)",
  "var(--color-text-faint)",
];

export function TrafficPieChart({
  sources,
  totalOrders,
}: {
  sources: TrafficSource[];
  totalOrders: number;
}) {
  return (
    <Card>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-2xl tabular-nums text-text">{totalOrders.toLocaleString()}</span>
      </div>
      <p className="mb-4 text-sm text-text-muted">Total orders in last 30 days</p>

      <div className="flex items-center gap-6">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                dataKey="visits"
                nameKey="source"
                innerRadius="55%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {sources.map((entry, i) => (
                  <Cell key={entry.source} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "var(--color-text)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-1 flex-col gap-2 text-sm">
          {sources.map((source, i) => (
            <li key={source.source} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate text-text-muted">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                  aria-hidden
                />
                <span className="truncate">{source.source}</span>
              </span>
              <span className="tabular-nums text-text-faint">
                {source.sharePercent}% {source.visits}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
