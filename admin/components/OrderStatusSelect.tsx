"use client";

import { useActionState, useRef } from "react";
import { updateOrderStatus, type OrderFormState } from "@/lib/actions/orders";
import { EDITABLE_ORDER_STATUSES } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-positive/10 text-positive",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-negative/10 text-negative",
  expired: "bg-negative/10 text-negative",
  refunded: "bg-text-faint/10 text-text-faint",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const action = updateOrderStatus.bind(null, orderId);
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Statuses outside the editable set (e.g. Nomod's transient "enabled"/
  // "created" session states, or "failed") show as read-only — editing them
  // manually doesn't correspond to a real action an admin should take.
  if (!EDITABLE_ORDER_STATUSES.includes(status as (typeof EDITABLE_ORDER_STATUSES)[number])) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-text-faint/10 px-2.5 py-1 text-xs capitalize text-text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
        {status}
      </span>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="inline-flex flex-col items-end gap-1">
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label={`Status for order ${orderId}`}
        className={`rounded-[var(--radius-pill)] border-0 px-2.5 py-1 text-xs capitalize focus-visible:outline-none disabled:opacity-50 ${STATUS_STYLES[status] ?? "bg-text-faint/10 text-text-faint"}`}
      >
        {EDITABLE_ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {state.error && <span className="text-[11px] text-negative">{state.error}</span>}
    </form>
  );
}
