import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

const fetchProductsMock = vi.fn();
vi.mock("@/lib/products", async () => {
  const actual = await vi.importActual<typeof import("@/lib/products")>("@/lib/products");
  return { ...actual, fetchProducts: () => fetchProductsMock() };
});

describe("ShopPage", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
    fetchProductsMock.mockResolvedValue(SAMPLE_PRODUCTS);
  });

  it("renders the full catalog with no brand filter by default", async () => {
    const { default: ShopPage } = await import("./page");

    const element = await ShopPage({ searchParams: Promise.resolve({}), params: Promise.resolve({}) });
    render(<AuthProvider><CartProvider><WishlistProvider>{element}</WishlistProvider></CartProvider></AuthProvider>);

    expect(screen.getByText(`${SAMPLE_PRODUCTS.length} laptops`)).toBeInTheDocument();
  });

  it("pre-filters to the brand given in the ?brand= query param", async () => {
    const { default: ShopPage } = await import("./page");
    const brand = SAMPLE_PRODUCTS[0].brand;

    const element = await ShopPage({
      searchParams: Promise.resolve({ brand }),
      params: Promise.resolve({}),
    });
    render(<AuthProvider><CartProvider><WishlistProvider>{element}</WishlistProvider></CartProvider></AuthProvider>);

    expect(screen.getByRole("button", { name: new RegExp(brand) })).toBeInTheDocument();
  });

  it("shows a load error when the product fetch fails", async () => {
    const { ProductFetchError } = await vi.importActual<typeof import("@/lib/products")>("@/lib/products");
    fetchProductsMock.mockRejectedValue(new ProductFetchError("boom"));
    const { default: ShopPage } = await import("./page");

    const element = await ShopPage({ searchParams: Promise.resolve({}), params: Promise.resolve({}) });
    render(<AuthProvider><CartProvider><WishlistProvider>{element}</WishlistProvider></CartProvider></AuthProvider>);

    expect(await screen.findByText(/couldn.?t load/i)).toBeInTheDocument();
  });
});
