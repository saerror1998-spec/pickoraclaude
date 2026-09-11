// The order's `status` column is the *payment* status Nomod reports
// (see storefront/lib/orders.ts) — these are the only real values that
// mean anything to that pipeline, plus "refunded" for a manual after-the-
// fact correction. Deliberately not adding invented fulfillment states
// (e.g. "shipped") here — Pickora has no shipment-tracking data model yet.
//
// Lives in this plain module (not lib/actions/orders.ts) because that file
// has a top-level "use server" directive: Next.js only allows async function
// exports from "use server" files, and a client component importing a
// non-function export from one gets a broken server-reference stub instead
// of the real value.
export const EDITABLE_ORDER_STATUSES = ["pending", "paid", "cancelled", "expired", "refunded"] as const;

export type TrendDirection = "up" | "down" | "flat";

export type StatSummary = {
  label: string;
  value: string;
  deltaLabel: string;
  trend: TrendDirection;
};

export type DailyPoint = {
  date: string; // e.g. "Mar 24"
  value: number;
};

export type MonthlyRevenuePoint = {
  month: string; // e.g. "Jan"
  revenueCents: number;
};

/** One "Insights & Performance" card: a real count plus a real denominator so the UI can render an honest progress bar (value/total), not a decorative one. */
export type InsightMetric = {
  label: string;
  value: number;
  total: number;
  deltaLabel: string;
  trend: TrendDirection;
};

export type DashboardOverview = {
  stats: {
    orders30d: StatSummary;
    revenue30d: StatSummary;
    averageOrderValue30d: StatSummary;
    paidOrders30d: StatSummary;
    newOrdersToday: StatSummary;
  };
  /** Daily order counts (any status) for the last 30 days. */
  ordersTrend: DailyPoint[];
  /** Paid revenue for the last 6 calendar months, oldest first. */
  revenueByMonth: MonthlyRevenuePoint[];
  totalOrdersLast30Days: number;
  /** Real order/catalog breakdowns for the Insights & Performance row. */
  insights: {
    pendingOrders: InsightMetric;
    cancelledOrders: InsightMetric;
    refundedOrders: InsightMetric;
    outOfStockProducts: InsightMetric;
    newCustomers30d: InsightMetric;
  };
  /** Most recent orders, newest first, for the Overview page's orders table. */
  recentOrders: AdminOrder[];
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  priceCents: number;
  inStock: boolean;
  condition: "Excellent" | "Good" | "Fair";
};

/** Full editable record for the product create/edit form — mirrors the storefront's Product shape. */
export type AdminProductDetail = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  processor: string;
  ramGb: number;
  storageGb: number;
  priceCents: number;
  originalPriceCents: number | null;
  compatibility: string[];
  condition: "Excellent" | "Good" | "Fair";
  inStock: boolean;
  sku: string | null;
  specText: string | null;
};

export type OrderLineItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type AdminOrder = {
  id: string;
  referenceId: string | null;
  nomodCheckoutId: string | null;
  status: string;
  totalCents: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  lineItems: OrderLineItem[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomer = {
  email: string;
  name: string | null;
  orderCount: number;
  paidOrderCount: number;
  totalSpentCents: number;
  lastOrderAt: string;
};

export type TopProduct = {
  productId: string;
  name: string;
  unitsSold: number;
  revenueCents: number;
};

export type SalesOverview = {
  totalRevenueCents: number;
  paidOrderCount: number;
  averageOrderValueCents: number;
  revenueTrend: DailyPoint[];
  topProducts: TopProduct[];
  recentSales: AdminOrder[];
};

export type StorageBucketSummary = {
  name: string;
  public: boolean;
  fileCount: number;
  totalSizeBytes: number;
};

export type StorageOverview = {
  buckets: StorageBucketSummary[];
  totalFileCount: number;
  totalSizeBytes: number;
};

export type CatalogComposition = {
  totalProducts: number;
  inStockCount: number;
  soldOutCount: number;
  byCondition: { condition: string; count: number }[];
  byBrand: { brand: string; count: number }[];
  averagePriceCents: number;
};

export type IntegrationStatusValue = "connected" | "not_configured" | "external";

export type IntegrationStatus = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatusValue;
  detail: string;
};

export type ActivityEventType = "order_placed" | "order_status_changed" | "product_listed";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  message: string;
  detail: string | null;
  timestamp: string;
};
