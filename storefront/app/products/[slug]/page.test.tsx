import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/products/some-slug",
}));

const fetchProductBySlugMock = vi.fn();
vi.mock("@/lib/products", async () => {
  const actual = await vi.importActual<typeof import("@/lib/products")>("@/lib/products");
  return { ...actual, fetchProductBySlug: (slug: string) => fetchProductBySlugMock(slug) };
});

const product = SAMPLE_PRODUCTS[0];

describe("ProductDetailPage", () => {
  beforeEach(() => {
    fetchProductBySlugMock.mockReset();
    fetchProductBySlugMock.mockResolvedValue(product);
  });

  it(
    "renders the product name and includes real JSON-LD product data",
    async () => {
      const { default: ProductDetailPage } = await import("./page");
      const element = await ProductDetailPage({
        params: Promise.resolve({ slug: product.slug }),
        searchParams: Promise.resolve({}),
      });
      const { container } = render(
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{element}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      );

      expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();

      const jsonLd = container.querySelector('script[type="application/ld+json"]');
      expect(jsonLd).toBeInTheDocument();
      const data = JSON.parse(jsonLd!.innerHTML);
      expect(data["@type"]).toBe("Product");
      expect(data.name).toBe(product.name);
      expect(data.offers.price).toBe((product.priceCents / 100).toFixed(2));
    },
    // Full-suite parallel runs can push this heavier render (three nested
    // providers + full PDP) past the default 5s timeout under CPU
    // contention, even though it's fast in isolation.
    15000
  );
});

describe("ProductDetailPage generateMetadata", () => {
  beforeEach(() => {
    fetchProductBySlugMock.mockReset();
  });

  it("builds a real, unique title and description from the product's own data", async () => {
    fetchProductBySlugMock.mockResolvedValue(product);
    const { generateMetadata } = await import("./page");

    const meta = await generateMetadata({ params: Promise.resolve({ slug: product.slug }), searchParams: Promise.resolve({}) });

    expect(meta.title).toBe(`${product.name} (${product.storageGb}GB/${product.ramGb}GB) – Refurbished | Pickora`);
    expect(meta.description).toContain(product.name);
    expect(meta.description).toContain(product.condition);
    expect(meta.description).toContain("90-day warranty");
  });

  it("falls back to a generic title when the product doesn't exist", async () => {
    fetchProductBySlugMock.mockResolvedValue(null);
    const { generateMetadata } = await import("./page");

    const meta = await generateMetadata({ params: Promise.resolve({ slug: "does-not-exist" }), searchParams: Promise.resolve({}) });

    expect(meta.title).toBe("Laptop not found | Pickora");
  });
});
