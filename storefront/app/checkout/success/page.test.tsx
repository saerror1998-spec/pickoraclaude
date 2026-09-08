import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "@/components/CartProvider";

const finalizeOrderMock = vi.fn();
vi.mock("@/lib/orders", () => ({
  finalizeOrder: (...args: unknown[]) => finalizeOrderMock(...args),
  OrderPersistenceError: class OrderPersistenceError extends Error {},
}));

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    finalizeOrderMock.mockReset();
  });

  it("reads the reference id from the ?order param and passes it to finalizeOrder", async () => {
    finalizeOrderMock.mockResolvedValue({ referenceId: "pickora-1", status: "paid", totalCents: 96500 });
    const { default: CheckoutSuccessPage } = await import("./page");

    const element = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order: "pickora-1" }),
      params: Promise.resolve({}),
    });
    render(<CartProvider>{element}</CartProvider>);

    expect(finalizeOrderMock).toHaveBeenCalledWith("pickora-1");
    expect(await screen.findByText("Payment successful")).toBeInTheDocument();
    expect(screen.getByText(/pickora-1/)).toBeInTheDocument();
  });

  it("falls back to a generic success message when there's no ?order param", async () => {
    const { default: CheckoutSuccessPage } = await import("./page");

    const element = await CheckoutSuccessPage({
      searchParams: Promise.resolve({}),
      params: Promise.resolve({}),
    });
    render(<CartProvider>{element}</CartProvider>);

    expect(finalizeOrderMock).not.toHaveBeenCalled();
    expect(await screen.findByText("Payment successful")).toBeInTheDocument();
  });

  it("shows the real verified status even on the success route (e.g. actually cancelled)", async () => {
    finalizeOrderMock.mockResolvedValue({ referenceId: "pickora-2", status: "cancelled", totalCents: 50000 });
    const { default: CheckoutSuccessPage } = await import("./page");

    const element = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order: "pickora-2" }),
      params: Promise.resolve({}),
    });
    render(<CartProvider>{element}</CartProvider>);

    expect(await screen.findByText("Checkout cancelled")).toBeInTheDocument();
  });

  it("shows 'not yet completed' rather than 'failed' for Nomod's real unpaid-session status ('enabled', despite their docs saying 'created')", async () => {
    finalizeOrderMock.mockResolvedValue({ referenceId: "pickora-3", status: "enabled", totalCents: 50000 });
    const { default: CheckoutSuccessPage } = await import("./page");

    const element = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order: "pickora-3" }),
      params: Promise.resolve({}),
    });
    render(<CartProvider>{element}</CartProvider>);

    expect(await screen.findByText("Payment not yet completed")).toBeInTheDocument();
    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
  });
});
