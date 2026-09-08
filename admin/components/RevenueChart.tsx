"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "./Card";
import { TrendBadge } from "./TrendBadge";
import { formatPrice } from "@/lib/format";
import type { MonthlyRevenuePoint } from "@/lib/types";

export function RevenueChart({
  data,
  highlightMonth,
}: {
  data: MonthlyRevenuePoint[];
  highlightMonth: string;
}) {
  const highlighted = data.find((d) => d.month === highlightMonth);

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-2xl tabular-nums text-text">
          {highlighted ? formatPrice(highlighted.revenueCents) : "—"}
        </span>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Revenue from campaigns in {highlightMonth}</span>
          <TrendBadge deltaLabel="+5.2%" trend="up" />
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
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.month === highlightMonth ? "var(--color-positive)" : "var(--color-card-border)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
