"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "./Card";
import { formatPrice } from "@/lib/format";
import type { DailyPoint } from "@/lib/types";

export function SalesTrendChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-2 text-center text-text-muted">
        No paid orders yet — revenue by day will show up here once someone completes checkout.
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <p className="mb-4 text-sm text-text-muted">Revenue by day, from real paid orders</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={2}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
              interval="preserveStartEnd"
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
            <Bar dataKey="value" radius={[3, 3, 0, 0]} fill="var(--color-positive)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
