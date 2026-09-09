"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "./Card";
import type { DailyPoint } from "@/lib/types";

// Only two options — the data feeding this chart is always a fixed 30-day
// window (see fetchDashboardOverview), so a "3M"/"6M" button would just
// show the same 30 days again rather than genuinely more data.
const RANGE_OPTIONS = ["14D", "1M"] as const;
type Range = (typeof RANGE_OPTIONS)[number];

const RANGE_DAYS: Record<Range, number> = { "14D": 14, "1M": 30 };

export function OrdersTrendChart({ data }: { data: DailyPoint[] }) {
  const [range, setRange] = useState<Range>("1M");
  const visiblePoints = data.slice(-Math.min(RANGE_DAYS[range], data.length));

  return (
    <Card className="col-span-full lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Orders placed per day</p>
        <div role="group" aria-label="Chart range" className="flex gap-1 rounded-[var(--radius-pill)] bg-bg p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs transition-colors duration-150 ${
                range === option ? "bg-card-border text-text" : "text-text-faint hover:text-text-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visiblePoints} barCategoryGap={2}>
            <XAxis dataKey="date" hide />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-card-border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--color-text)",
              }}
              labelStyle={{ color: "var(--color-text-muted)" }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} fill="var(--color-text-muted)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
