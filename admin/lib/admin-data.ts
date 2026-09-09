import { getSupabaseAdminClient } from "./supabase/admin-server";
import { getSupabaseClient } from "./supabase/client";
import { SAMPLE_DASHBOARD } from "./sample-data";
import type {
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  CatalogComposition,
  DailyPoint,
  DashboardOverview,
  IntegrationStatus,
  IntegrationStatusValue,
  OrderLineItem,
  SalesOverview,
  StorageBucketSummary,
  StorageOverview,
  TopProduct,
} from "./types";

export class AdminDataError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AdminDataError";
  }
}

/**
 * Loads the overview dashboard's stats/charts. Pickora doesn't have an
 * `orders`/analytics pipeline yet, so this currently always returns sample
 * data shaped like the real thing (see lib/types.ts) — swapping in a real
 * `orders` table later only requires implementing the query below, not
 * touching any dashboard component.
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
    // TODO: once an orders/analytics pipeline exists, replace this with real
    // aggregation queries. Structure is already in place via SAMPLE_DASHBOARD's shape.
    return SAMPLE_DASHBOARD;
  } catch (cause) {
    throw new AdminDataError("Failed to load dashboard overview", cause);
  }
}

/** Loads the product catalog for the Products admin section (real Supabase data). */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, price_cents, in_stock, condition")
      .order("name", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((row): AdminProduct => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      priceCents: row.price_cents,
      inStock: row.in_stock,
      condition: row.condition,
    }));
  } catch (cause) {
    throw new AdminDataError("Failed to load products", cause);
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
