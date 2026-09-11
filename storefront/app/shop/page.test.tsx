import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shop",
}));

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

describe("ShopPage generateMetadata", () => {
  it("returns the generic catalog title with no brand filter", async () => {
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({ searchParams: Promise.resolve({}), params: Promise.resolve({}) });

    expect(meta.title).toBe("Shop All Refurbished Laptops | Dell, HP & Lenovo | Pickora");
  });

  it("returns a real, unique title for a known brand", async () => {
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      searchParams: Promise.resolve({ brand: "Dell" }),
      params: Promise.resolve({}),
    });

    expect(meta.title).toBe("Refurbished Dell Laptops in the UAE | Latitude & Inspiron | Pickora");
    expect(meta.description).toContain("Dell");
  });

  it("still generates a unique (not generic-fallback) title for a brand outside the fixed list", async () => {
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      searchParams: Promise.resolve({ brand: "Asus" }),
      params: Promise.resolve({}),
    });

    expect(meta.title).toBe("Refurbished Asus Laptops UAE | Pickora");
    expect(meta.title).not.toBe("Shop All Refurbished Laptops | Dell, HP & Lenovo | Pickora");
  });
});
