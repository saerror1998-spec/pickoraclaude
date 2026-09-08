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
