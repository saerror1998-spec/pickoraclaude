import type { DashboardOverview } from "./types";

/**
 * Fallback dashboard data used when SUPABASE_SERVICE_ROLE_KEY isn't
 * configured, or when there's no `orders` table / analytics pipeline yet
 * (Pickora doesn't have one at launch). Shaped identically to what real
 * queries in lib/admin-data.ts return, so swapping in real data later is a
 * query change, not a UI change.
 */
export const SAMPLE_DASHBOARD: DashboardOverview = {
  stats: {
    orders30d: { label: "Orders (30d)", value: "1,842", deltaLabel: "+4.1% vs prior 30 days", trend: "up" },
    revenue30d: { label: "Revenue (30d)", value: "$284,600", deltaLabel: "+6.8% vs prior 30 days", trend: "up" },
    averageOrderValue30d: {
      label: "Average order value",
      value: "$154.60",
      deltaLabel: "+1.3% vs prior 30 days",
      trend: "up",
    },
  },
  ordersTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 2, 22 + i);
    const base = 40 + Math.sin(i / 3) * 20 + (i % 7 === 0 ? 15 : 0);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(8, Math.round(base + (i * 1.3))),
    };
  }),
  revenueByMonth: [
    { month: "Jun", revenueCents: 5400000 },
    { month: "Jul", revenueCents: 5100000 },
    { month: "Aug", revenueCents: 9250000 },
    { month: "Sep", revenueCents: 5600000 },
    { month: "Oct", revenueCents: 5300000 },
    { month: "Nov", revenueCents: 5800000 },
  ],
  totalOrdersLast30Days: 1842,
};
