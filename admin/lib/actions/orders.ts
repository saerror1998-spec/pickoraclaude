"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderFormState = { error: string | null };

// The order's `status` column is the *payment* status Nomod reports
// (see storefront/lib/orders.ts) — these are the only real values that
// mean anything to that pipeline, plus "refunded" for a manual after-the-
// fact correction. Deliberately not adding invented fulfillment states
// (e.g. "shipped") here — Pickora has no shipment-tracking data model yet.
export const EDITABLE_ORDER_STATUSES = ["pending", "paid", "cancelled", "expired", "refunded"] as const;

async function requireAdminUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!data.user) {
    return { error: "You must be signed in to do this." };
  }
  return null;
}

export async function updateOrderStatus(
  orderId: string,
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const authError = await requireAdminUser();
  if (authError) return authError;

  const status = String(formData.get("status") ?? "");
  if (!EDITABLE_ORDER_STATUSES.includes(status as (typeof EDITABLE_ORDER_STATUSES)[number])) {
    return { error: `"${status}" isn't a recognized order status.` };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase isn't configured for this environment." };

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return { error: `Failed to update order status: ${error.message}` };
  }

  revalidatePath("/orders");
  return { error: null };
}
