"use client";

import { useState } from "react";
import type { CheckoutLineItem } from "@/lib/nomod";

export function CheckoutButton({ lineItems }: { lineItems: CheckoutLineItem[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Checkout could not be started");
      }

      window.location.href = payload.checkoutUrl;
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong starting checkout"
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={status === "loading" || lineItems.length === 0}
        className="w-full rounded-[var(--radius-pill)] bg-ink px-8 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Redirecting to checkout…" : "Checkout with Nomod"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {errorMessage} — please try again, or contact support if this keeps happening.
        </p>
      )}
    </div>
  );
}
