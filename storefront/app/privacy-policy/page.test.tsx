import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { AuthProvider } from "@/components/AuthProvider";
import PrivacyPolicyPage from "./page";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: async () => null,
}));

describe("PrivacyPolicyPage", () => {
  it("renders the real support email, not a placeholder", () => {
    render(
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <PrivacyPolicyPage />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@pickoraonline.com" })).toHaveAttribute(
      "href",
      "mailto:hello@pickoraonline.com"
    );
    expect(screen.queryByText(/Insert date/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Insert support/)).not.toBeInTheDocument();
  });
});
