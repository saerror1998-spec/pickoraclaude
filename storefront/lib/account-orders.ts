import "server-only";
import { getSupabaseAdminClient } from "./supabase/admin-server";

export type AccountOrderLineItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type AccountOrder = {
  id: string;
  referenceId: string | null;
  status: string;
  totalCents: number;
  currency: string;
  lineItems: AccountOrderLineItem[];
  createdAt: string;
};

/**
 * Loads order history for the signed-in customer's account page. The
 * `orders` table has no user_id column (see admin/supabase/schema.sql) — it
 * only gets a customer_email once Nomod's checkout status reports one — so
 * orders are matched by email rather than auth user id. Uses the
 * service-role client since `orders` has no public RLS policy. Returns []
 * when Supabase isn't configured or the customer has no orders yet.
 */
export async function fetchOrdersForEmail(email: string): Promise<AccountOrder[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id, reference_id, status, total_cents, currency, line_items, created_at")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row): AccountOrder => ({
    id: row.id,
    referenceId: row.reference_id,
    status: row.status,
    totalCents: row.total_cents,
    currency: row.currency,
    lineItems: (row.line_items ?? []) as AccountOrderLineItem[],
    createdAt: row.created_at,
  }));
}
