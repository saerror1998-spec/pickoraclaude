import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountDashboard } from "./AccountDashboard";

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ updateProfile: vi.fn(), signInWithPassword: vi.fn(), setPassword: vi.fn(), signOut: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const ORDERS = [
  {
    id: "order-1",
    referenceId: "pickora-1",
    status: "paid",
    totalCents: 96500,
    currency: "AED",
    lineItems: [{ productId: "p1", name: "ThinkPad X1 Carbon", priceCents: 96500, quantity: 1 }],
    createdAt: "2026-01-15T10:00:00.000Z",
  },
];

describe("AccountDashboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("defaults to the My Orders section", () => {
    render(<AccountDashboard displayName="Buyer Bee" email="buyer@example.com" hasPassword orders={ORDERS} />);
    expect(screen.getByText("Order #pickora-1")).toBeInTheDocument();
  });

  it("switches to Manage Address, showing an honest empty state (no fabricated saved addresses)", async () => {
    const user = userEvent.setup();
    render(<AccountDashboard displayName="Buyer Bee" email="buyer@example.com" hasPassword orders={ORDERS} />);

    await user.click(screen.getByRole("button", { name: "Manage Address" }));

    expect(screen.getByText("No saved addresses yet")).toBeInTheDocument();
    expect(screen.queryByText("Order #pickora-1")).not.toBeInTheDocument();
  });

  it("switches to Payment Method, showing an honest empty state (no fabricated saved cards)", async () => {
    const user = userEvent.setup();
    render(<AccountDashboard displayName="Buyer Bee" email="buyer@example.com" hasPassword orders={ORDERS} />);

    await user.click(screen.getByRole("button", { name: "Payment Method" }));

    expect(screen.getByText("No saved payment methods")).toBeInTheDocument();
  });

  it("switches to Personal Information", async () => {
    const user = userEvent.setup();
    render(<AccountDashboard displayName="Buyer Bee" email="buyer@example.com" hasPassword orders={ORDERS} />);

    await user.click(screen.getByRole("button", { name: "Personal Information" }));

    expect(screen.getByLabelText("Full name")).toHaveValue("Buyer Bee");
  });

  it("switches to Password Manager", async () => {
    const user = userEvent.setup();
    render(<AccountDashboard displayName="Buyer Bee" email="buyer@example.com" hasPassword orders={ORDERS} />);

    await user.click(screen.getByRole("button", { name: "Password Manager" }));

    expect(screen.getByText("Password manager")).toBeInTheDocument();
  });
});
