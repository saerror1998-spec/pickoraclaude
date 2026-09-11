import { getSupabaseAdminClient } from "./supabase/admin-server";
import { getSupabaseClient } from "./supabase/client";
import { SAMPLE_DASHBOARD } from "./sample-data";
import { formatPrice } from "./format";
import type {
  ActivityEvent,
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  AdminProductDetail,
  CatalogComposition,
  DailyPoint,
  DashboardOverview,
  InsightMetric,
  IntegrationStatus,
  IntegrationStatusValue,
  MonthlyRevenuePoint,
  OrderLineItem,
  SalesOverview,
  StatSummary,
  StorageBucketSummary,
  StorageOverview,
  TopProduct,
  TrendDirection,
} from "./types";

export class AdminDataError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AdminDataError";
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Builds a period-over-period stat, avoiding a divide-by-zero when the prior period had no data. */
function periodStat(
  label: string,
  current: number,
  previous: number,
  formatValue: (n: number) => string
): StatSummary {
  const value = formatValue(current);

  if (previous === 0) {
    return {
      label,
      value,
      deltaLabel: current === 0 ? "No orders yet" : "No prior-period data",
      trend: "flat",
    };
  }

  const pctChange = ((current - previous) / previous) * 100;
  const trend: TrendDirection = pctChange > 0.5 ? "up" : pctChange < -0.5 ? "down" : "flat";
  const sign = pctChange >= 0 ? "+" : "";
  return { label, value, deltaLabel: `${sign}${pctChange.toFixed(1)}% vs prior 30 days`, trend };
}

/** Builds an Insights & Performance card: a real count, a real denominator for its progress bar, and a period-over-period trend. */
function periodInsight(label: string, current: number, previous: number, total: number): InsightMetric {
  if (previous === 0) {
    return {
      label,
      value: current,
      total,
      deltaLabel: current === 0 ? "None this month" : "No prior-period data",
      trend: "flat",
    };
  }
  const pctChange = ((current - previous) / previous) * 100;
  const trend: TrendDirection = pctChange > 0.5 ? "up" : pctChange < -0.5 ? "down" : "flat";
  const sign = pctChange >= 0 ? "+" : "";
  return { label, value: current, total, deltaLabel: `${sign}${pctChange.toFixed(1)}% vs prior 30 days`, trend };
}

/**
 * Loads the overview dashboard's stats/charts from real orders — order
 * volume, revenue, and average order value, each compared against the
 * prior 30-day period, plus a 30-day order-count trend and 6-month revenue
 * chart. There's no web analytics/traffic provider connected (see the
 * Analytics page), so this deliberately has no conversion-rate or funnel
 * data — that would have to be fabricated.
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return SAMPLE_DASHBOARD;

  try {
    const { error } = await supabase.from("orders").select("id", { count: "exact", head: true });
    if (error) {
      // No orders table yet (or RLS misconfigured) — fall back rather than
      // showing a broken dashboard on day one.
      return SAMPLE_DASHBOARD;
    }

    const orders = await fetchAdminOrders();

    const now = Date.now();
    const last30Start = now - 30 * DAY_MS;
    const prev30Start = now - 60 * DAY_MS;

    const last30 = orders.filter((o) => new Date(o.createdAt).getTime() >= last30Start);
    const prev30 = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= prev30Start && t < last30Start;
    });

    const last30Paid = last30.filter((o) => o.status === PAID_STATUS);
    const prev30Paid = prev30.filter((o) => o.status === PAID_STATUS);

    const last30Revenue = last30Paid.reduce((sum, o) => sum + o.totalCents, 0);
    const prev30Revenue = prev30Paid.reduce((sum, o) => sum + o.totalCents, 0);

    const last30Aov = last30Paid.length > 0 ? Math.round(last30Revenue / last30Paid.length) : 0;
    const prev30Aov = prev30Paid.length > 0 ? Math.round(prev30Revenue / prev30Paid.length) : 0;

    const ordersByDay = new Map<string, number>();
    for (const order of last30) {
      const day = order.createdAt.slice(0, 10);
      ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    }
    const ordersTrend: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: ordersByDay.get(key) ?? 0,
      };
    });

    const revenueByMonthMap = new Map<string, number>();
    for (const order of orders) {
      if (order.status !== PAID_STATUS) continue;
      const key = order.createdAt.slice(0, 7); // "YYYY-MM"
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) ?? 0) + order.totalCents);
    }
    const revenueByMonth: MonthlyRevenuePoint[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        revenueCents: revenueByMonthMap.get(key) ?? 0,
      };
    });

    const last1Start = now - DAY_MS;
    const prev1Start = now - 2 * DAY_MS;
    const newOrdersToday = orders.filter((o) => new Date(o.createdAt).getTime() >= last1Start).length;
    const newOrdersYesterday = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= prev1Start && t < last1Start;
    }).length;

    const byStatus = (status: string, pool: AdminOrder[]) => pool.filter((o) => o.status === status).length;

    // "New customer" = an email whose earliest order (across all history, not
    // just the last 30 days) falls in the window — a repeat buyer who happens
    // to order again this month shouldn't count as "new".
    const firstOrderByEmail = new Map<string, number>();
    for (const order of orders) {
      if (!order.customerEmail) continue;
      const t = new Date(order.createdAt).getTime();
      const existing = firstOrderByEmail.get(order.customerEmail);
      if (existing === undefined || t < existing) firstOrderByEmail.set(order.customerEmail, t);
    }
    const firstOrderTimes = Array.from(firstOrderByEmail.values());
    const newCustomersLast30 = firstOrderTimes.filter((t) => t >= last30Start).length;
    const newCustomersPrev30 = firstOrderTimes.filter((t) => t >= prev30Start && t < last30Start).length;

    const catalog = await fetchCatalogComposition();

    return {
      stats: {
        orders30d: periodStat("Orders (30d)", last30.length, prev30.length, (n) => n.toLocaleString("en-US")),
        revenue30d: periodStat("Revenue (30d)", last30Revenue, prev30Revenue, formatPrice),
        averageOrderValue30d: periodStat("Average order value", last30Aov, prev30Aov, formatPrice),
        paidOrders30d: periodStat("Paid orders (30d)", last30Paid.length, prev30Paid.length, (n) =>
          n.toLocaleString("en-US")
        ),
        newOrdersToday: periodStat("New orders (today)", newOrdersToday, newOrdersYesterday, (n) =>
          n.toLocaleString("en-US")
        ),
      },
      ordersTrend,
      revenueByMonth,
      totalOrdersLast30Days: last30.length,
      insights: {
        pendingOrders: periodInsight(
          "Pending orders",
          byStatus("pending", last30),
          byStatus("pending", prev30),
          last30.length || 1
        ),
        cancelledOrders: periodInsight(
          "Cancelled orders",
          byStatus("cancelled", last30),
          byStatus("cancelled", prev30),
          last30.length || 1
        ),
        refundedOrders: periodInsight(
          "Refunded orders",
          byStatus("refunded", last30),
          byStatus("refunded", prev30),
          last30.length || 1
        ),
        // No historical stock snapshot exists to compare against, so this is
        // a live count rather than a period-over-period stat like the others
        // — routing it through periodInsight would fabricate a "vs prior 30
        // days" comparison for data that doesn't have one.
        outOfStockProducts: {
          label: "Out of stock",
          value: catalog.soldOutCount,
          total: catalog.totalProducts || 1,
          deltaLabel: "Live count",
          trend: "flat",
        },
        newCustomers30d: periodInsight(
          "New customers",
          newCustomersLast30,
          newCustomersPrev30,
          firstOrderTimes.length || 1
        ),
      },
      recentOrders: orders.slice(0, 8),
    };
  } catch (cause) {
    throw new AdminDataError("Failed to load dashboard overview", cause);
  }
}

const PRODUCT_DETAIL_COLUMNS =
  "id, slug, name, brand, image, processor, ram_gb, storage_gb, price_cents, original_price_cents, compatibility, condition, in_stock, sku, spec_text";

function mapProductDetailRow(row: {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  processor: string;
  ram_gb: number;
  storage_gb: number;
  price_cents: number;
  original_price_cents: number | null;
  compatibility: string[] | null;
  condition: AdminProductDetail["condition"];
  in_stock: boolean;
  sku: string | null;
  spec_text: string | null;
}): AdminProductDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    image: row.image,
    processor: row.processor,
    ramGb: row.ram_gb,
    storageGb: row.storage_gb,
    priceCents: row.price_cents,
    originalPriceCents: row.original_price_cents,
    compatibility: row.compatibility ?? [],
    condition: row.condition,
    inStock: row.in_stock,
    sku: row.sku,
    specText: row.spec_text,
  };
}

/** Loads the product catalog for the Products admin section (real Supabase data). */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, brand, image, price_cents, in_stock, condition")
      .order("name", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((row): AdminProduct => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      brand: row.brand,
      image: row.image,
      priceCents: row.price_cents,
      inStock: row.in_stock,
      condition: row.condition,
    }));
  } catch (cause) {
    throw new AdminDataError("Failed to load products", cause);
  }
}

/** Loads one product's full editable fields for the create/edit form. Returns null when not found. */
export async function fetchAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapProductDetailRow(data);
  } catch (cause) {
    throw new AdminDataError(`Failed to load product "${id}"`, cause);
  }
}

// "paid" is the one Nomod status value we know maps to a completed sale —
// see storefront/lib/orders.ts and the README note on Nomod's docs being
// unreliable about the full set of real status values.
const PAID_STATUS = "paid";

/** Loads all orders (newest first) for the Orders admin section. */
export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, reference_id, nomod_checkout_id, status, total_cents, currency, customer_email, customer_name, line_items, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((row): AdminOrder => ({
      id: row.id,
      referenceId: row.reference_id,
      nomodCheckoutId: row.nomod_checkout_id,
      status: row.status,
      totalCents: row.total_cents,
      currency: row.currency,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      lineItems: (row.line_items ?? []) as OrderLineItem[],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (cause) {
    throw new AdminDataError("Failed to load orders", cause);
  }
}

/**
 * Derives a customer list from orders (there's no separate customers table
 * — an order only has a known customer email/name once Nomod's checkout
 * status reports one, i.e. once payment was attempted). Grouped by email,
 * sorted by most recent order first.
 */
export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  const orders = await fetchAdminOrders();

  const byEmail = new Map<string, AdminCustomer>();
  for (const order of orders) {
    if (!order.customerEmail) continue;

    const existing = byEmail.get(order.customerEmail);
    const isPaid = order.status === PAID_STATUS;

    if (!existing) {
      byEmail.set(order.customerEmail, {
        email: order.customerEmail,
        name: order.customerName,
        orderCount: 1,
        paidOrderCount: isPaid ? 1 : 0,
        totalSpentCents: isPaid ? order.totalCents : 0,
        lastOrderAt: order.createdAt,
      });
      continue;
    }

    existing.orderCount += 1;
    if (isPaid) {
      existing.paidOrderCount += 1;
      existing.totalSpentCents += order.totalCents;
    }
    if (!existing.name && order.customerName) existing.name = order.customerName;
    if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
  }

  return Array.from(byEmail.values()).sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1));
}

/**
 * Loads the Sales section's data — entirely real, derived from `orders`
 * (via fetchAdminOrders(), which already handles the "not configured" and
 * error cases). Only PAID orders count toward revenue/AOV/top products;
 * unpaid/abandoned checkouts are excluded rather than treated as sales.
 */
export async function fetchSalesOverview(): Promise<SalesOverview> {
  const orders = await fetchAdminOrders();
  const paidOrders = orders.filter((order) => order.status === PAID_STATUS);

  const totalRevenueCents = paidOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const paidOrderCount = paidOrders.length;
  const averageOrderValueCents = paidOrderCount > 0 ? Math.round(totalRevenueCents / paidOrderCount) : 0;

  const revenueByDay = new Map<string, number>();
  for (const order of paidOrders) {
    const day = order.createdAt.slice(0, 10); // YYYY-MM-DD
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + order.totalCents);
  }
  const revenueTrend: DailyPoint[] = Array.from(revenueByDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, revenueCents]) => ({
      date: new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: revenueCents,
    }));

  const productTotals = new Map<string, TopProduct>();
  for (const order of paidOrders) {
    for (const item of order.lineItems) {
      const existing = productTotals.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenueCents += item.priceCents * item.quantity;
      } else {
        productTotals.set(item.productId, {
          productId: item.productId,
          name: item.name,
          unitsSold: item.quantity,
          revenueCents: item.priceCents * item.quantity,
        });
      }
    }
  }
  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);

  // fetchAdminOrders() already sorts newest-first.
  const recentSales = paidOrders.slice(0, 10);

  return { totalRevenueCents, paidOrderCount, averageOrderValueCents, revenueTrend, topProducts, recentSales };
}

/**
 * Loads real Supabase Storage usage for the Storage section — every bucket,
 * its file count, and total size. Paginates each bucket's file list (capped
 * at 20 pages of 1000 so a very large bucket can't hang the admin page).
 */
export async function fetchStorageOverview(): Promise<StorageOverview> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { buckets: [], totalFileCount: 0, totalSizeBytes: 0 };

  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    if (!buckets) return { buckets: [], totalFileCount: 0, totalSizeBytes: 0 };

    const summaries: StorageBucketSummary[] = [];
    for (const bucket of buckets) {
      let fileCount = 0;
      let totalSizeBytes = 0;
      let offset = 0;
      const limit = 1000;

      for (let page = 0; page < 20; page++) {
        const { data: files, error: listError } = await supabase.storage
          .from(bucket.name)
          .list("", { limit, offset, sortBy: { column: "name", order: "asc" } });
        if (listError) throw listError;
        if (!files || files.length === 0) break;

        for (const file of files) {
          if (file.id === null) continue; // folder placeholder entry, not a real file
          fileCount += 1;
          totalSizeBytes += (file.metadata?.size as number | undefined) ?? 0;
        }

        if (files.length < limit) break;
        offset += limit;
      }

      summaries.push({ name: bucket.name, public: bucket.public, fileCount, totalSizeBytes });
    }

    return {
      buckets: summaries,
      totalFileCount: summaries.reduce((sum, bucket) => sum + bucket.fileCount, 0),
      totalSizeBytes: summaries.reduce((sum, bucket) => sum + bucket.totalSizeBytes, 0),
    };
  } catch (cause) {
    throw new AdminDataError("Failed to load storage overview", cause);
  }
}

/**
 * Loads real product-catalog composition for the Analytics section. Pickora
 * has no web analytics/traffic provider connected yet (see the Analytics
 * page itself for that honest caveat) — this is the analytics we *do* have
 * real data for, derived from fetchAdminProducts().
 */
export async function fetchCatalogComposition(): Promise<CatalogComposition> {
  const products = await fetchAdminProducts();

  const inStockCount = products.filter((product) => product.inStock).length;

  const conditionCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  let totalPriceCents = 0;
  for (const product of products) {
    conditionCounts.set(product.condition, (conditionCounts.get(product.condition) ?? 0) + 1);
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
    totalPriceCents += product.priceCents;
  }

  const byCondition = Array.from(conditionCounts.entries()).map(([condition, count]) => ({ condition, count }));
  const byBrand = Array.from(brandCounts.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalProducts: products.length,
    inStockCount,
    soldOutCount: products.length - inStockCount,
    byCondition,
    byBrand,
    averagePriceCents: products.length > 0 ? Math.round(totalPriceCents / products.length) : 0,
  };
}

/**
 * Loads the Integrations section's data. Only the two Supabase-backed
 * pieces can actually be live-checked from the admin app (its own service
 * role client) — Nomod, Google sign-in, and Hostinger are configured
 * elsewhere (storefront env vars, the Supabase dashboard, hPanel) and are
 * reported as "external" with a pointer, rather than faking a live check
 * this app has no way to perform.
 */
export async function fetchIntegrationsStatus(): Promise<IntegrationStatus[]> {
  const supabase = getSupabaseAdminClient();

  let databaseStatus: IntegrationStatusValue = "not_configured";
  let databaseDetail = "SUPABASE_SERVICE_ROLE_KEY isn't set — admin queries have nothing to connect to.";
  if (supabase) {
    try {
      const { error } = await supabase.from("products").select("id", { count: "exact", head: true });
      if (error) throw error;
      databaseStatus = "connected";
      databaseDetail = "Live query to the products table succeeded.";
    } catch {
      databaseStatus = "not_configured";
      databaseDetail = "Service role key is set, but a live query to Supabase failed.";
    }
  }

  let storageStatus: IntegrationStatusValue = "not_configured";
  let storageDetail = "No product-images bucket found yet — run the storefront's bulk import script.";
  if (supabase) {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      if (buckets?.some((bucket) => bucket.name === "product-images")) {
        storageStatus = "connected";
        storageDetail = "The product-images bucket exists and is reachable.";
      }
    } catch {
      storageStatus = "not_configured";
      storageDetail = "Couldn't reach Supabase Storage to check.";
    }
  }

  return [
    {
      id: "supabase-database",
      name: "Supabase database",
      description: "Products, orders, and customers all live here.",
      status: databaseStatus,
      detail: databaseDetail,
    },
    {
      id: "supabase-storage",
      name: "Supabase Storage",
      description: "Hosts product photos uploaded by the bulk importer.",
      status: storageStatus,
      detail: storageDetail,
    },
    {
      id: "google-auth",
      name: "Google sign-in",
      description: "Customers sign in with Google before adding to cart.",
      status: "external",
      detail:
        "Configured in the Supabase dashboard (Authentication → Providers) and Google Cloud Console — not something this admin app can check directly.",
    },
    {
      id: "nomod",
      name: "Nomod checkout",
      description: "Hosted checkout used for real payments.",
      status: "external",
      detail: "Configured via NOMOD_API_KEY in the storefront app's environment — not visible from admin.",
    },
    {
      id: "hostinger",
      name: "Hostinger deployment",
      description: "Both apps deploy from the pickoraclaude GitHub repo via git push.",
      status: "external",
      detail: "Managed in Hostinger's hPanel — check there for build and deploy status.",
    },
  ];
}

/**
 * Loads real store events for the Activity and Logs sections — order
 * placement, order status changes, and new product listings, all derived
 * from `orders` and `products` rather than a dedicated audit-log table
 * (Pickora doesn't have one). Deliberately does NOT use Supabase Auth's
 * admin user list for this — storefront customers and admin staff share
 * one Supabase project, so that list is mostly Google sign-ins from
 * shoppers, not admin activity, and surfacing it here would both mislabel
 * it and expose customer emails outside the customers section.
 */
export async function fetchActivityFeed(): Promise<ActivityEvent[]> {
  const orders = await fetchAdminOrders();
  const orderEvents: ActivityEvent[] = [];
  for (const order of orders) {
    const ref = order.referenceId ?? order.id.slice(0, 8);
    orderEvents.push({
      id: `${order.id}-placed`,
      type: "order_placed",
      message: `Order ${ref} placed`,
      detail: order.customerEmail,
      timestamp: order.createdAt,
    });
    if (order.updatedAt !== order.createdAt) {
      orderEvents.push({
        id: `${order.id}-status`,
        type: "order_status_changed",
        message: `Order ${ref} status changed to "${order.status}"`,
        detail: order.customerEmail,
        timestamp: order.updatedAt,
      });
    }
  }

  const productEvents = await fetchRecentlyListedProductEvents();

  return [...orderEvents, ...productEvents].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 100);
}

async function fetchRecentlyListedProductEvents(): Promise<ActivityEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data) return [];

    return data.map(
      (row): ActivityEvent => ({
        id: `product-${row.id}`,
        type: "product_listed",
        message: `${row.brand} ${row.name} listed`,
        detail: null,
        timestamp: row.created_at,
      })
    );
  } catch (cause) {
    throw new AdminDataError("Failed to load recently listed products", cause);
  }
}
