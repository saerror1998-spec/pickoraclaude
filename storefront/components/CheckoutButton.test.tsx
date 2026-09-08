import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutButton } from "./CheckoutButton";

const lineItems = [{ productId: "1", name: "ThinkPad X1 Carbon", priceCents: 89900, quantity: 1 }];

describe("CheckoutButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // jsdom doesn't implement navigation; stub it so redirect assignment doesn't throw.
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to the Nomod checkout URL on success", async () => {
    const user = userEvent.setup();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: "https://checkout.nomod.com/session_123", sessionId: "session_123" }),
    });

    render(<CheckoutButton lineItems={lineItems} />);
    await user.click(screen.getByRole("button", { name: /checkout with nomod/i }));

    await waitFor(() => expect(window.location.href).toBe("https://checkout.nomod.com/session_123"));
  });

  it("shows an error message when the checkout API returns an error", async () => {
    const user = userEvent.setup();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "NOMOD_API_KEY is not configured." }),
    });

    render(<CheckoutButton lineItems={lineItems} />);
    await user.click(screen.getByRole("button", { name: /checkout with nomod/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("NOMOD_API_KEY is not configured.");
  });

  it("shows an error message on network failure", async () => {
    const user = userEvent.setup();
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError("Failed to fetch"));

    render(<CheckoutButton lineItems={lineItems} />);
    await user.click(screen.getByRole("button", { name: /checkout with nomod/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to fetch");
  });

  it("disables the button when the cart is empty", () => {
    render(<CheckoutButton lineItems={[]} />);
    expect(screen.getByRole("button", { name: /checkout with nomod/i })).toBeDisabled();
  });
});
