"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "./Card";
import { TrendBadge } from "./TrendBadge";
import { formatPrice } from "@/lib/format";
import type { MonthlyRevenuePoint } from "@/lib/types";

export function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  // Always highlight the most recent month — the last entry, since callers
  // pass these oldest-first.
  const highlighted = data.at(-1);
  const previous = data.at(-2);
  const trend =
    previous && previous.revenueCents > 0
      ? (highlighted?.revenueCents ?? 0) > previous.revenueCents
        ? "up"
        : (highlighted?.revenueCents ?? 0) < previous.revenueCents
          ? "down"
          : "flat"
      : "flat";
  const deltaLabel =
    previous && previous.revenueCents > 0
      ? `${(((highlighted?.revenueCents ?? 0) - previous.revenueCents) / previous.revenueCents * 100).toFixed(1)}% vs ${previous.month}`
      : "No prior-month data";

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-2xl tabular-nums text-text">
          {highlighted ? formatPrice(highlighted.revenueCents) : "—"}
        </span>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Paid revenue in {highlighted?.month ?? "—"}</span>
          <TrendBadge deltaLabel={deltaLabel} trend={trend} />
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={8}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(value) => formatPrice(Number(value))}
              contentStyle={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-card-border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--color-text)",
              }}
              labelStyle={{ color: "var(--color-text-muted)" }}
            />
            <Bar dataKey="revenueCents" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.month}-${i}`}
                  fill={i === data.length - 1 ? "var(--color-positive)" : "var(--color-card-border)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
