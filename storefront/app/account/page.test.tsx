import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";

const getUserMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/account",
}));

const fetchOrdersForEmailMock = vi.fn();
vi.mock("@/lib/account-orders", () => ({
  fetchOrdersForEmail: (...args: unknown[]) => fetchOrdersForEmailMock(...args),
}));

describe("AccountPage", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    fetchOrdersForEmailMock.mockReset();
    fetchOrdersForEmailMock.mockResolvedValue([]);
  });

  it("shows a sign-in prompt when there's no session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { default: AccountPage } = await import("./page");

    const element = await AccountPage();
    render(<AuthProvider><CartProvider>{element}</CartProvider></AuthProvider>);

    expect(screen.getByText("Sign in to view your account and order history.")).toBeInTheDocument();
    expect(fetchOrdersForEmailMock).not.toHaveBeenCalled();
  });

  it("shows the signed-in customer's profile and an empty-orders state", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "buyer@example.com", user_metadata: { full_name: "Buyer Bee" } } },
    });
    const { default: AccountPage } = await import("./page");

    const element = await AccountPage();
    render(<AuthProvider><CartProvider>{element}</CartProvider></AuthProvider>);

    expect(screen.getByText("Buyer Bee")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(fetchOrdersForEmailMock).toHaveBeenCalledWith("buyer@example.com");
    expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument();
  });

  it("renders order history with status and total", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "buyer@example.com", user_metadata: {} } },
    });
    fetchOrdersForEmailMock.mockResolvedValue([
      {
        id: "order-1",
        referenceId: "pickora-1",
        status: "paid",
        totalCents: 96500,
        currency: "AED",
        lineItems: [{ productId: "p1", name: "ThinkPad X1 Carbon", priceCents: 96500, quantity: 1 }],
        createdAt: "2026-01-15T10:00:00.000Z",
      },
    ]);
    const { default: AccountPage } = await import("./page");

    const element = await AccountPage();
    render(<AuthProvider><CartProvider>{element}</CartProvider></AuthProvider>);

    expect(screen.getByText("Order #pickora-1")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText(/ThinkPad X1 Carbon/)).toBeInTheDocument();
  });
});
