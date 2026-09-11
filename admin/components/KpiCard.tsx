"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendBadge } from "./TrendBadge";
import type { StatSummary } from "@/lib/types";
import type { ReactNode } from "react";

/**
 * Top-row KPI card. `value` on StatSummary is already a formatted string
 * (currency/locale-formatted), so this animates in with a reveal rather than
 * a numeric count-up — tweening a pre-formatted "AED 1,234" string would
 * mean re-parsing currency text, which is fragile for no real benefit.
 *
 * `icon` takes an already-rendered element (not a component reference) so
 * the server-rendered Overview page can pass it across the client boundary —
 * function props aren't serializable there.
 */
export function KpiCard({
  stat,
  icon,
  index = 0,
}: {
  stat: StatSummary;
  icon: ReactNode;
  index?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className="glass-card flex flex-col gap-3 p-5 transition-shadow duration-200 ease-[var(--ease-expo-out)] hover:shadow-[var(--shadow-card-lg)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="text-sm text-text-muted">{stat.label}</span>
      <span className="text-2xl tabular-nums text-text">{stat.value}</span>
      <TrendBadge deltaLabel={stat.deltaLabel} trend={stat.trend} />
    </motion.div>
  );
}
