import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import DeliveryPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/delivery",
}));

function renderDeliveryPage() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <DeliveryPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("DeliveryPage", () => {
  it("lists every real UAE emirate covered", () => {
    renderDeliveryPage();

    for (const emirate of ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"]) {
      expect(screen.getByText(emirate)).toBeInTheDocument();
    }
  });

  it("links to the real warranty and support pages", () => {
    renderDeliveryPage();

    expect(screen.getByRole("link", { name: "Read the warranty" })).toHaveAttribute("href", "/warranty");
    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/support");
  });
});
