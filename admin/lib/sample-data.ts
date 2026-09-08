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
    orders: { label: "Orders", value: "1,842", deltaLabel: "+4.1% vs prior 30 days", trend: "up" },
    averageOrderValueCents: {
      label: "Average order value",
      value: "$154.60",
      deltaLabel: "+1.3% vs prior 30 days",
      trend: "up",
    },
    conversionRate: {
      label: "Store conversion",
      value: "3.06%",
      deltaLabel: "+0.6% vs prior 30 days",
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
    { month: "Jan", revenueCents: 4100000 },
    { month: "Feb", revenueCents: 4600000 },
    { month: "Mar", revenueCents: 4300000 },
    { month: "Apr", revenueCents: 5200000 },
    { month: "May", revenueCents: 4900000 },
    { month: "Jun", revenueCents: 5400000 },
    { month: "Jul", revenueCents: 5100000 },
    { month: "Aug", revenueCents: 9250000 },
    { month: "Sep", revenueCents: 5600000 },
    { month: "Oct", revenueCents: 5300000 },
    { month: "Nov", revenueCents: 5800000 },
  ],
  revenueHighlightMonth: "Aug",
  funnel: [
    { stage: "Add to cart", count: 38200, percentOfPrevious: null },
    { stage: "Checkout", count: 16800, percentOfPrevious: 44 },
    { stage: "Purchase", count: 5640, percentOfPrevious: 34 },
  ],
  trafficSources: [
    { source: "Organic search", visits: 698, sharePercent: 37.9 },
    { source: "Direct", visits: 516, sharePercent: 28.0 },
    { source: "Referral", visits: 276, sharePercent: 15.0 },
    { source: "Paid social", visits: 221, sharePercent: 12.0 },
    { source: "Others", visits: 131, sharePercent: 7.1 },
  ],
  totalOrdersLast30Days: 1842,
};
