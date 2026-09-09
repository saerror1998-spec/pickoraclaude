import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import SupportPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/support",
}));

function renderSupportPage() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SupportPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("SupportPage", () => {
  it("shows a mailto link to the support email", () => {
    renderSupportPage();

    const emailLink = screen.getByRole("link", { name: /hello@pickoraonline.com/ });
    expect(emailLink).toHaveAttribute("href", "mailto:hello@pickoraonline.com");
  });

  it("expands an FAQ item to reveal its answer", async () => {
    const user = userEvent.setup();
    renderSupportPage();

    await user.click(screen.getByText("Where's my order?"));

    expect(screen.getByRole("link", { name: "View your orders" })).toHaveAttribute("href", "/account");
  });

  it("links the warranty FAQ answer to the warranty page", async () => {
    const user = userEvent.setup();
    renderSupportPage();

    await user.click(screen.getByText("What does the warranty cover?"));

    expect(screen.getByRole("link", { name: "Read the warranty" })).toHaveAttribute("href", "/warranty");
  });
});
