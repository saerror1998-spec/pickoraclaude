import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import WarrantyPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/warranty",
}));

describe("WarrantyPage", () => {
  it("renders covered and not-covered lists", () => {
    render(
      <AuthProvider>
        <CartProvider>
          <WarrantyPage />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText("What's covered")).toBeInTheDocument();
    expect(screen.getByText("What's not covered")).toBeInTheDocument();
    expect(screen.getByText(/Hardware failures under normal use/)).toBeInTheDocument();
    expect(screen.getByText(/Accidental damage/)).toBeInTheDocument();
  });

  it("links to the support page for filing a claim", () => {
    render(
      <AuthProvider>
        <CartProvider>
          <WarrantyPage />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/support");
  });
});
