import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import WarrantyPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/warranty",
}));

function renderWarrantyPage() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <WarrantyPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("WarrantyPage", () => {
  it("renders covered and not-covered lists", () => {
    renderWarrantyPage();

    expect(screen.getByText("What's covered")).toBeInTheDocument();
    expect(screen.getByText("What's not covered")).toBeInTheDocument();
    expect(screen.getByText(/Hardware failures under normal use/)).toBeInTheDocument();
    expect(screen.getAllByText(/Accidental damage/).length).toBeGreaterThan(0);
  });

  it("links to the support page for filing a claim", () => {
    renderWarrantyPage();

    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/support");
  });

  it("expands the extend-warranty FAQ and gives an honest 'not currently' answer", async () => {
    const user = userEvent.setup();
    renderWarrantyPage();

    await user.click(screen.getByText("Can I extend it?"));

    expect(screen.getByText(/Not currently/)).toBeInTheDocument();
  });

  it("includes real FAQPage structured data matching the on-page FAQ", () => {
    const { container } = renderWarrantyPage();

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toBeInTheDocument();
    const data = JSON.parse(jsonLd!.innerHTML);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.map((q: { name: string }) => q.name)).toContain("What voids the warranty?");
  });
});
