"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUpNumber } from "./CountUpNumber";
import { TrendBadge } from "./TrendBadge";
import type { InsightMetric } from "@/lib/types";
import type { ReactNode } from "react";

const BAR_COLOR_BY_TREND = {
  up: "bg-positive",
  down: "bg-negative",
  flat: "bg-accent",
} as const;

/** `icon` is an already-rendered element — see KpiCard for why. */
export function InsightCard({
  insight,
  icon,
  index = 0,
  barColor,
}: {
  insight: InsightMetric;
  icon: ReactNode;
  index?: number;
  /** Override the trend-based bar color — e.g. "warning" tint for out-of-stock, which isn't a trend. */
  barColor?: "up" | "down" | "flat" | "warning";
}) {
  const prefersReducedMotion = useReducedMotion();
  const pct = insight.total > 0 ? Math.min(100, (insight.value / insight.total) * 100) : 0;
  const barClass = barColor === "warning" ? "bg-warning" : BAR_COLOR_BY_TREND[barColor ?? insight.trend];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className="glass-card flex flex-col gap-3 p-5 transition-shadow duration-200 ease-[var(--ease-expo-out)] hover:shadow-[var(--shadow-card-lg)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
          {icon}
        </span>
        <span className="text-lg tabular-nums text-text">
          <CountUpNumber value={insight.value} />
        </span>
      </div>

      <span className="text-sm text-text-muted">{insight.label}</span>

      <div className="h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-bg">
        <motion.div
          className={`h-full rounded-[var(--radius-pill)] ${barClass}`}
          initial={prefersReducedMotion ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: index * 0.06 + 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <TrendBadge deltaLabel={insight.deltaLabel} trend={insight.trend} />
    </motion.div>
  );
}
