import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/laptops-under-500-aed",
}));

const fetchProductsMock = vi.fn();
vi.mock("@/lib/products", async () => {
  const actual = await vi.importActual<typeof import("@/lib/products")>("@/lib/products");
  return { ...actual, fetchProducts: () => fetchProductsMock() };
});

const base = SAMPLE_PRODUCTS[0];

function renderPage(element: React.ReactNode) {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{element}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("LaptopsUnder500Page", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
  });

  it("shows only real in-stock products priced at or under 500 AED", async () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Cheap Chromebook", priceCents: 45000, inStock: true },
      { ...base, id: "2", name: "Exactly 500", priceCents: 50000, inStock: true },
      { ...base, id: "3", name: "Too expensive", priceCents: 50100, inStock: true },
      { ...base, id: "4", name: "Cheap but out of stock", priceCents: 40000, inStock: false },
    ];
    fetchProductsMock.mockResolvedValue(products);
    const { default: LaptopsUnder500Page } = await import("./page");

    const element = await LaptopsUnder500Page();
    renderPage(element);

    expect(screen.getByText("Cheap Chromebook")).toBeInTheDocument();
    expect(screen.getByText("Exactly 500")).toBeInTheDocument();
    expect(screen.queryByText("Too expensive")).not.toBeInTheDocument();
    expect(screen.queryByText("Cheap but out of stock")).not.toBeInTheDocument();
  });

  it("shows a real empty state (not a fake product grid) when nothing qualifies", async () => {
    fetchProductsMock.mockResolvedValue([{ ...base, id: "1", priceCents: 99999, inStock: true }]);
    const { default: LaptopsUnder500Page } = await import("./page");

    const element = await LaptopsUnder500Page();
    renderPage(element);

    expect(screen.getByText(/Nothing.s in stock under 500 AED right now/)).toBeInTheDocument();
  });

  it("includes real FAQPage structured data", async () => {
    fetchProductsMock.mockResolvedValue([{ ...base, id: "1", priceCents: 40000, inStock: true }]);
    const { default: LaptopsUnder500Page } = await import("./page");

    const element = await LaptopsUnder500Page();
    const { container } = renderPage(element);

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toBeInTheDocument();
    expect(JSON.parse(jsonLd!.innerHTML)["@type"]).toBe("FAQPage");
  });
});
