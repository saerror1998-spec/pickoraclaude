import { describe, expect, it, afterEach } from "vitest";
import { filterProducts, sortProducts, formatPrice, getSavePercent } from "./products";
import { SAMPLE_PRODUCTS } from "./sample-data";

const EMPTY_FILTERS = { compatibility: [], priceMin: null, priceMax: null, brand: null };

describe("filterProducts", () => {
  it("returns all products when filters are empty", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, EMPTY_FILTERS);
    expect(result).toHaveLength(SAMPLE_PRODUCTS.length);
  });

  it("filters by compatibility", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, compatibility: ["macOS"] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.compatibility.includes("macOS"))).toBe(true);
  });

  it("filters by price range", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, priceMin: 50000, priceMax: 100000 });
    expect(result.every((p) => p.priceCents >= 50000 && p.priceCents <= 100000)).toBe(true);
  });

  it("filters by brand", () => {
    const brand = SAMPLE_PRODUCTS[0].brand;
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, brand });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.brand === brand)).toBe(true);
  });

  it("returns an empty array when no product matches", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, compatibility: ["macOS"], priceMin: 0, priceMax: 1 });
    expect(result).toHaveLength(0);
  });
});

describe("getSavePercent", () => {
  it("returns the rounded discount percentage when the original price is higher", () => {
    expect(getSavePercent({ priceCents: 8000, originalPriceCents: 10000 })).toBe(20);
  });

  it("returns null when there's no original price", () => {
    expect(getSavePercent({ priceCents: 8000, originalPriceCents: null })).toBeNull();
  });

  it("returns null when the original price isn't actually higher", () => {
    expect(getSavePercent({ priceCents: 8000, originalPriceCents: 8000 })).toBeNull();
  });
});

describe("sortProducts", () => {
  it("sorts by price ascending", () => {
    const result = sortProducts(SAMPLE_PRODUCTS, "price-asc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceCents).toBeGreaterThanOrEqual(result[i - 1].priceCents);
    }
  });

  it("sorts by price descending", () => {
    const result = sortProducts(SAMPLE_PRODUCTS, "price-desc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i].priceCents).toBeLessThanOrEqual(result[i - 1].priceCents);
    }
  });

  it("does not mutate the input array", () => {
    const original = [...SAMPLE_PRODUCTS];
    sortProducts(SAMPLE_PRODUCTS, "price-asc");
    expect(SAMPLE_PRODUCTS).toEqual(original);
  });

  it("featured sort is a stable no-op ordering", () => {
    const result = sortProducts(SAMPLE_PRODUCTS, "featured");
    expect(result.map((p) => p.id)).toEqual(SAMPLE_PRODUCTS.map((p) => p.id));
  });
});

describe("formatPrice", () => {
  const originalCurrency = process.env.NEXT_PUBLIC_STORE_CURRENCY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_STORE_CURRENCY = originalCurrency;
  });

  it("formats cents as whole-dollar USD by default", () => {
    delete process.env.NEXT_PUBLIC_STORE_CURRENCY;
    expect(formatPrice(89900)).toBe("$899");
  });

  it("respects NEXT_PUBLIC_STORE_CURRENCY", () => {
    process.env.NEXT_PUBLIC_STORE_CURRENCY = "AED";
    expect(formatPrice(89900)).toContain("899");
  });
});
