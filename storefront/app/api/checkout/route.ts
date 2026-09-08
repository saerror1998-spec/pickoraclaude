import { NextRequest, NextResponse } from "next/server";
import { createNomodCheckoutSession, NomodCheckoutError, type CheckoutLineItem } from "@/lib/nomod";
import { createPendingOrder } from "@/lib/orders";

type CheckoutRequestBody = {
  lineItems: CheckoutLineItem[];
};

function isValidLineItem(item: unknown): item is CheckoutLineItem {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.productId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.priceCents === "number" &&
    candidate.priceCents > 0 &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0
  );
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.lineItems) || !body.lineItems.every(isValidLineItem)) {
    return NextResponse.json({ error: "Invalid or missing lineItems" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const referenceId = `pickora-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  // We control these URLs, so we embed our own reference — no need to guess
  // what query params Nomod's redirect might add (it has no documented
  // webhook system, so this is also how order status ultimately gets
  // reconciled: see lib/orders.ts).
  const redirectParam = `order=${encodeURIComponent(referenceId)}`;

  try {
    const session = await createNomodCheckoutSession(
      body.lineItems,
      referenceId,
      `${origin}/checkout/success?${redirectParam}`,
      `${origin}/checkout/failed?${redirectParam}`,
      `${origin}/checkout/cancelled?${redirectParam}`
    );

    try {
      const totalCents = body.lineItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      await createPendingOrder({
        referenceId,
        nomodCheckoutId: session.sessionId,
        lineItems: body.lineItems,
        totalCents,
        currency: process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD",
      });
    } catch (orderError) {
      // Don't block checkout on our own bookkeeping failing — the payment
      // flow itself still works; log so it's visible without breaking the
      // customer's checkout.
      console.error("Failed to persist pending order", orderError);
    }

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof NomodCheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ error: "Unexpected checkout error" }, { status: 500 });
  }
}
