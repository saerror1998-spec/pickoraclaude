import { getSupabaseAdminClient } from "./supabase/admin-server";
import { getNomodCheckoutStatus } from "./nomod";
import type { CheckoutLineItem } from "./nomod";

export class OrderPersistenceError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "OrderPersistenceError";
  }
}

const NOMOD_STATUS_TO_ORDER_STATUS: Record<string, string> = {
  paid: "paid",
  cancelled: "cancelled",
  expired: "expired",
  created: "created",
};

/**
 * Inserts a 'pending' order row at the moment a Nomod checkout session is
 * created, so an order always exists even if the customer never returns to
 * a redirect URL. Best-effort: a failure here shouldn't block checkout
 * (the payment flow works without it), so callers should log, not throw,
 * on failure. Returns null when Supabase isn't configured.
 */
export async function createPendingOrder(params: {
  referenceId: string;
  nomodCheckoutId: string;
  lineItems: CheckoutLineItem[];
  totalCents: number;
  currency: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from("orders").insert({
    reference_id: params.referenceId,
    nomod_checkout_id: params.nomodCheckoutId,
    status: "pending",
    total_cents: params.totalCents,
    currency: params.currency,
    line_items: params.lineItems,
  });

  if (error) {
    throw new OrderPersistenceError("Failed to create pending order", error);
  }
}

export type FinalizedOrder = {
  referenceId: string;
  status: string;
  totalCents: number;
};

/**
 * Called from the checkout status pages (success/failed/cancelled). Looks
 * up the local pending order by reference_id, verifies the REAL status via
 * Nomod's API (never trusts which redirect page the browser landed on —
 * that URL can be hand-navigated to), and updates the local row to match.
 * Idempotent: safe to call multiple times (e.g. page refresh) or from
 * whichever of the three status pages the customer actually reaches.
 */
export async function finalizeOrder(referenceId: string): Promise<FinalizedOrder | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("nomod_checkout_id, total_cents")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (fetchError) {
    throw new OrderPersistenceError("Failed to look up order", fetchError);
  }
  if (!order) return null;

  const nomodStatus = await getNomodCheckoutStatus(order.nomod_checkout_id);
  const orderStatus = NOMOD_STATUS_TO_ORDER_STATUS[nomodStatus.status] ?? nomodStatus.status;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: orderStatus,
      customer_email: nomodStatus.customerEmail,
      customer_name: nomodStatus.customerName,
      updated_at: new Date().toISOString(),
    })
    .eq("reference_id", referenceId);

  if (updateError) {
    throw new OrderPersistenceError("Failed to update order status", updateError);
  }

  return { referenceId, status: orderStatus, totalCents: order.total_cents };
}
