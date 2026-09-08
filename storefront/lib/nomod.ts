export class NomodCheckoutError extends Error {
  constructor(message: string, readonly status?: number, readonly cause?: unknown) {
    super(message);
    this.name = "NomodCheckoutError";
  }
}

export type CheckoutLineItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type CheckoutSession = {
  checkoutUrl: string;
  sessionId: string;
};

function toDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Creates a Nomod hosted checkout session server-side. Never call this from
 * the browser — it requires NOMOD_API_KEY, which must stay off the client.
 *
 * Matches Nomod's real API (https://nomod.com/docs/api-reference/create-checkout):
 * POST https://api.nomod.com/v1/checkout, auth via the X-API-KEY header (not
 * Bearer), amounts as decimal strings in the main currency unit (not cents),
 * and three separate redirect URLs (success/failure/cancelled).
 */
export async function createNomodCheckoutSession(
  lineItems: CheckoutLineItem[],
  referenceId: string,
  successUrl: string,
  failureUrl: string,
  cancelledUrl: string
): Promise<CheckoutSession> {
  const apiKey = process.env.NOMOD_API_KEY;
  const baseUrl = process.env.NOMOD_API_BASE_URL ?? "https://api.nomod.com";
  const currency = (process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD").toUpperCase();

  if (!apiKey) {
    throw new NomodCheckoutError(
      "NOMOD_API_KEY is not configured. Add it to .env.local (see .env.local.example)."
    );
  }
  if (lineItems.length === 0) {
    throw new NomodCheckoutError("Cannot start checkout with an empty cart.");
  }

  const totalCents = lineItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        reference_id: referenceId.slice(0, 100),
        amount: toDecimalString(totalCents),
        currency,
        items: lineItems.map((item) => ({
          item_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          unit_amount: toDecimalString(item.priceCents),
          total_amount: toDecimalString(item.priceCents * item.quantity),
          net_amount: toDecimalString(item.priceCents * item.quantity),
        })),
        success_url: successUrl,
        failure_url: failureUrl,
        cancelled_url: cancelledUrl,
      }),
    });
  } catch (cause) {
    throw new NomodCheckoutError("Network error contacting Nomod checkout API", undefined, cause);
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // response body already consumed or unreadable; fall through with empty detail
    }
    throw new NomodCheckoutError(
      `Nomod checkout session creation failed: ${response.status}${detail ? ` — ${detail}` : ""}`,
      response.status
    );
  }

  const payload = (await response.json()) as { url?: string; id?: string };
  if (!payload.url || !payload.id) {
    throw new NomodCheckoutError("Nomod returned an unexpected response shape");
  }

  return { checkoutUrl: payload.url, sessionId: payload.id };
}

export type NomodCheckoutStatus = {
  id: string;
  status: "created" | "cancelled" | "expired" | "paid" | string;
  amount: number;
  currency: string;
  referenceId: string;
  customerEmail: string | null;
  customerName: string | null;
};

/**
 * Looks up the real, current status of a checkout session server-side.
 * Nomod has no webhook system (confirmed against their full docs sitemap —
 * no such page exists), so this is the only trustworthy way to confirm a
 * payment actually completed: never treat "the customer reached the
 * success page" as proof of payment on its own, since that URL can be
 * hand-navigated to.
 *
 * Matches https://nomod.com/docs/api-reference/retrieve-checkout:
 * GET https://api.nomod.com/v1/checkout/{id}, same X-API-KEY auth.
 */
export async function getNomodCheckoutStatus(checkoutId: string): Promise<NomodCheckoutStatus> {
  const apiKey = process.env.NOMOD_API_KEY;
  const baseUrl = process.env.NOMOD_API_BASE_URL ?? "https://api.nomod.com";

  if (!apiKey) {
    throw new NomodCheckoutError(
      "NOMOD_API_KEY is not configured. Add it to .env.local (see .env.local.example)."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/checkout/${encodeURIComponent(checkoutId)}`, {
      headers: { "X-API-KEY": apiKey },
    });
  } catch (cause) {
    throw new NomodCheckoutError("Network error contacting Nomod checkout API", undefined, cause);
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // response body already consumed or unreadable; fall through with empty detail
    }
    throw new NomodCheckoutError(
      `Failed to retrieve Nomod checkout status: ${response.status}${detail ? ` — ${detail}` : ""}`,
      response.status
    );
  }

  const payload = (await response.json()) as {
    id?: string;
    status?: string;
    amount?: number;
    currency?: string;
    reference_id?: string;
    customer?: { email?: string; first_name?: string; last_name?: string } | null;
  };

  if (!payload.id || !payload.status) {
    throw new NomodCheckoutError("Nomod returned an unexpected response shape");
  }

  const customerName = payload.customer
    ? [payload.customer.first_name, payload.customer.last_name].filter(Boolean).join(" ") || null
    : null;

  return {
    id: payload.id,
    status: payload.status,
    amount: payload.amount ?? 0,
    currency: payload.currency ?? "",
    referenceId: payload.reference_id ?? "",
    customerEmail: payload.customer?.email || null,
    customerName,
  };
}
