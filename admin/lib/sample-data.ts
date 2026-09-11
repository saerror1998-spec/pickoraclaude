import type { DashboardOverview } from "./types";

const SAMPLE_RECENT_ORDERS: DashboardOverview["recentOrders"] = [
  {
    id: "sample-1",
    referenceId: "pickora-1001",
    nomodCheckoutId: null,
    status: "paid",
    totalCents: 129900,
    currency: "AED",
    customerEmail: "amina.k@example.com",
    customerName: "Amina Khan",
    lineItems: [{ productId: "p1", name: "Dell Latitude 5300 (Renewed)", priceCents: 129900, quantity: 1 }],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-2",
    referenceId: "pickora-1002",
    nomodCheckoutId: null,
    status: "pending",
    totalCents: 55000,
    currency: "AED",
    customerEmail: "yousef.a@example.com",
    customerName: "Yousef Al-Farsi",
    lineItems: [{ productId: "p2", name: "HP Chromebook 11 G4", priceCents: 55000, quantity: 1 }],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-3",
    referenceId: "pickora-1003",
    nomodCheckoutId: null,
    status: "cancelled",
    totalCents: 89900,
    currency: "AED",
    customerEmail: "sara.m@example.com",
    customerName: "Sara Mansour",
    lineItems: [{ productId: "p3", name: "Lenovo ThinkPad T480 (Renewed)", priceCents: 89900, quantity: 1 }],
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

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
    paidOrders30d: { label: "Paid orders (30d)", value: "1,690", deltaLabel: "+5.2% vs prior 30 days", trend: "up" },
    newOrdersToday: { label: "New orders (today)", value: "24", deltaLabel: "+9.1% vs yesterday", trend: "up" },
  },
  ordersTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 2, 22 + i);
    const base = 40 + Math.sin(i / 3) * 20 + (i % 7 === 0 ? 15 : 0);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(8, Math.round(base + i * 1.3)),
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
  insights: {
    pendingOrders: { label: "Pending orders", value: 62, total: 1842, deltaLabel: "+4.0% vs prior 30 days", trend: "up" },
    cancelledOrders: {
      label: "Cancelled orders",
      value: 18,
      total: 1842,
      deltaLabel: "-2.1% vs prior 30 days",
      trend: "down",
    },
    refundedOrders: { label: "Refunded orders", value: 7, total: 1842, deltaLabel: "No prior-period data", trend: "flat" },
    outOfStockProducts: { label: "Out of stock", value: 41, total: 437, deltaLabel: "Live count", trend: "flat" },
    newCustomers30d: {
      label: "New customers",
      value: 214,
      total: 980,
      deltaLabel: "+11.3% vs prior 30 days",
      trend: "up",
    },
  },
  recentOrders: SAMPLE_RECENT_ORDERS,
};
