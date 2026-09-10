import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/brands/dell",
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
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

describe("BrandPage", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
  });

  it("resolves the slug to the real brand and shows only that brand's products", async () => {
    const products: Product[] = [
      { ...base, id: "1", brand: "Dell", name: "Dell One", inStock: true },
      { ...base, id: "2", brand: "HP", name: "HP One", inStock: true },
    ];
    fetchProductsMock.mockResolvedValue(products);
    const { default: BrandPage } = await import("./page");

    const element = await BrandPage({ params: Promise.resolve({ brand: "dell" }), searchParams: Promise.resolve({}) });
    renderPage(element);

    expect(screen.getByRole("heading", { level: 1, name: /Refurbished Dell Laptops/ })).toBeInTheDocument();
    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.queryByText("HP One")).not.toBeInTheDocument();
  });

  it("404s for a slug matching no real brand", async () => {
    fetchProductsMock.mockResolvedValue([{ ...base, id: "1", brand: "Dell" }]);
    const { default: BrandPage } = await import("./page");

    await expect(BrandPage({ params: Promise.resolve({ brand: "nonexistent" }), searchParams: Promise.resolve({}) })).rejects.toThrow();
  });
});

describe("BrandPage generateMetadata", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
  });

  it("returns real dedicated metadata for a known brand slug", async () => {
    fetchProductsMock.mockResolvedValue([{ ...base, id: "1", brand: "Dell" }]);
    const { generateMetadata } = await import("./page");

    const meta = await generateMetadata({ params: Promise.resolve({ brand: "dell" }), searchParams: Promise.resolve({}) });
    expect(meta.title).toBe("Refurbished Dell Laptops in the UAE | Latitude & Inspiron | Pickora");
  });
});
