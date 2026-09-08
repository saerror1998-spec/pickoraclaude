import { getSupabaseAdminClient } from "./supabase/admin-server";
import { getSupabaseClient } from "./supabase/client";
import { SAMPLE_DASHBOARD } from "./sample-data";
import type { AdminCustomer, AdminOrder, AdminProduct, DashboardOverview, OrderLineItem } from "./types";

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
