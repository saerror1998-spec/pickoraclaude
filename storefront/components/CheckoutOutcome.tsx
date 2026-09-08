import { CheckoutStatusCard } from "./CheckoutStatusCard";
import { finalizeOrder, OrderPersistenceError } from "@/lib/orders";
import { NomodCheckoutError } from "@/lib/nomod";

const OUTCOME_BY_STATUS: Record<
  string,
  { icon: string; title: string; message: string; action: { href: string; label: string } }
> = {
  paid: {
    icon: "✓",
    title: "Payment successful",
    message:
      "Thanks for your order — a confirmation will be sent to your email shortly. Our team will reach out with shipping details.",
    action: { href: "/", label: "Continue shopping" },
  },
  cancelled: {
    icon: "×",
    title: "Checkout cancelled",
    message: "No charge was made. You can pick up where you left off whenever you're ready.",
    action: { href: "/#catalog", label: "Back to shop" },
  },
  expired: {
    icon: "!",
    title: "Checkout link expired",
    message: "This checkout session timed out before payment completed. No charge was made — please start again.",
    action: { href: "/#catalog", label: "Back to shop" },
  },
  // Nomod's docs claim an unpaid session's status is "created", but the real
  // API returns "enabled" — confirmed by hitting the live API directly.
  // Mapping both to the same copy in case either shows up.
  created: {
    icon: "…",
    title: "Payment not yet completed",
    message: "We haven't received confirmation of this payment yet. If you completed payment, please check back shortly.",
    action: { href: "/#catalog", label: "Back to shop" },
  },
  enabled: {
    icon: "…",
    title: "Payment not yet completed",
    message: "We haven't received confirmation of this payment yet. If you completed payment, please check back shortly.",
    action: { href: "/#catalog", label: "Back to shop" },
  },
};

const FAILED_OUTCOME = {
  icon: "!",
  title: "Payment failed",
  message: "Your payment couldn't be completed. No charge was made — please try again, or use a different payment method.",
  action: { href: "/#catalog", label: "Back to shop" },
};

const UNKNOWN_ORDER_OUTCOME = {
  icon: "!",
  title: "We couldn't find that order",
  message: "This checkout link looks incomplete or has already been used. If you completed a payment, check your email for confirmation.",
  action: { href: "/#catalog", label: "Back to shop" },
};

const ERROR_OUTCOME = {
  icon: "!",
  title: "We couldn't confirm your payment status",
  message: "Something went wrong verifying this order. If you completed payment, it will still be processed — check your email, or contact support with your order reference.",
  action: { href: "/#catalog", label: "Back to shop" },
};

/**
 * Renders the checkout outcome based on the REAL, Nomod-verified order
 * status — not on which of the three redirect routes (success/failed/
 * cancelled) the browser happened to land on. That route is just Nomod's
 * best guess at the time of redirect; landing on /checkout/success proves
 * nothing on its own (the URL can be hand-navigated to), so this is the
 * single place that actually decides what the customer sees.
 */
export async function CheckoutOutcome({
  referenceId,
  fallbackStatus,
}: {
  referenceId: string | undefined;
  fallbackStatus: keyof typeof OUTCOME_BY_STATUS | "failed";
}) {
  if (!referenceId) {
    const outcome = fallbackStatus === "failed" ? FAILED_OUTCOME : OUTCOME_BY_STATUS[fallbackStatus];
    return <RenderOutcome outcome={outcome} />;
  }

  let outcome: typeof FAILED_OUTCOME;
  try {
    const result = await finalizeOrder(referenceId);
    outcome = result ? OUTCOME_BY_STATUS[result.status] ?? FAILED_OUTCOME : UNKNOWN_ORDER_OUTCOME;
  } catch (error) {
    if (error instanceof OrderPersistenceError || error instanceof NomodCheckoutError) {
      console.error("Failed to finalize order", error.message, error.cause);
      outcome = ERROR_OUTCOME;
    } else {
      throw error;
    }
  }

  return <RenderOutcome outcome={outcome} referenceId={referenceId} />;
}

function RenderOutcome({
  outcome,
  referenceId,
}: {
  outcome: { icon: string; title: string; message: string; action: { href: string; label: string } };
  referenceId?: string;
}) {
  return (
    <CheckoutStatusCard
      icon={<span aria-hidden>{outcome.icon}</span>}
      title={outcome.title}
      message={outcome.message}
      referenceId={referenceId}
      primaryAction={outcome.action}
    />
  );
}
