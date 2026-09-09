import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrdersTable } from "./OrdersTable";
import type { AdminOrder } from "@/lib/types";

// lib/actions/orders.ts is a real "use server" module (imports the
// service-role Supabase client via a server-only guard) — Next's build
// strips that down to a safe client-side action reference automatically,
// but Vitest doesn't do that RSC transform, so it needs mocking here.
vi.mock("@/lib/actions/orders", () => ({
  updateOrderStatus: async () => ({ error: null }),
  EDITABLE_ORDER_STATUSES: ["pending", "paid", "cancelled", "expired", "refunded"],
}));

const order: AdminOrder = {
  id: "o1",
  referenceId: "pickora-1",
  nomodCheckoutId: "nomod-1",
  status: "paid",
  totalCents: 96500,
  currency: "AED",
  customerEmail: "buyer@example.com",
  customerName: "Buyer One",
  lineItems: [{ productId: "p1", name: "ThinkPad", priceCents: 96500, quantity: 1 }],
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:05:00.000Z",
};

describe("OrdersTable", () => {
  it("shows an empty state with no orders", () => {
    render(<OrdersTable orders={[]} />);
    expect(screen.getByText(/No orders yet/)).toBeInTheDocument();
  });

  it("renders order reference, customer, total, and status", () => {
    render(<OrdersTable orders={[order]} />);

    expect(screen.getByText("pickora-1")).toBeInTheDocument();
    expect(screen.getByText("Buyer One")).toBeInTheDocument();
    expect(screen.getByText("AED 965")).toBeInTheDocument();
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("falls back to the order id and email when name/reference are missing", () => {
    render(
      <OrdersTable
        orders={[{ ...order, referenceId: null, customerName: null }]}
      />
    );

    expect(screen.getByText("o1")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
  });

  it("sums quantities across line items for the item count", () => {
    render(
      <OrdersTable
        orders={[
          {
            ...order,
            lineItems: [
              { productId: "p1", name: "A", priceCents: 1000, quantity: 2 },
              { productId: "p2", name: "B", priceCents: 1000, quantity: 3 },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText("5 items")).toBeInTheDocument();
  });
});
