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

export type FunnelStage = {
  stage: string;
  count: number;
  percentOfPrevious: number | null;
};

export type TrafficSource = {
  source: string;
  visits: number;
  sharePercent: number;
};

export type DashboardOverview = {
  stats: {
    orders: StatSummary;
    averageOrderValueCents: StatSummary;
    conversionRate: StatSummary;
  };
  ordersTrend: DailyPoint[];
  revenueByMonth: MonthlyRevenuePoint[];
  revenueHighlightMonth: string;
  funnel: FunnelStage[];
  trafficSources: TrafficSource[];
  totalOrdersLast30Days: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  brand: string;
  priceCents: number;
  inStock: boolean;
  condition: "Excellent" | "Good" | "Fair";
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
