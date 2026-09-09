import { describe, expect, it, vi, beforeEach } from "vitest";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

const fetchProductsMock = vi.fn();
vi.mock("@/lib/products", () => ({
  fetchProducts: () => fetchProductsMock(),
}));

describe("sitemap", () => {
  beforeEach(() => {
    fetchProductsMock.mockReset();
  });

  it("includes every static route and every real product slug", async () => {
    fetchProductsMock.mockResolvedValue(SAMPLE_PRODUCTS);
    const { default: sitemap } = await import("./sitemap");

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://store.pickoraonline.com");
    expect(urls).toContain("https://store.pickoraonline.com/shop");
    for (const product of SAMPLE_PRODUCTS) {
      expect(urls).toContain(`https://store.pickoraonline.com/products/${product.slug}`);
    }
  });

  it("still returns the static routes if the product fetch fails", async () => {
    fetchProductsMock.mockRejectedValue(new Error("boom"));
    const { default: sitemap } = await import("./sitemap");

    const entries = await sitemap();
    expect(entries.map((e) => e.url)).toContain("https://store.pickoraonline.com");
  });
});
