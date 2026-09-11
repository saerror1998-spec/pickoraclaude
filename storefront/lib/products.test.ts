import { describe, expect, it, afterEach } from "vitest";
import {
  filterProducts,
  sortProducts,
  formatPrice,
  getSavePercent,
  paginate,
  parseCatalogSearchParams,
  buildCatalogQueryString,
} from "./products";
import { SAMPLE_PRODUCTS } from "./sample-data";
import type { ProductFilters } from "./types";

const EMPTY_FILTERS = {
  compatibility: [],
  priceMin: null,
  priceMax: null,
  brand: null,
  ramMin: null,
  ramMax: null,
  storageMin: null,
  storageMax: null,
};

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

  it("filters by RAM range", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, ramMin: 9, ramMax: 16 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.ramGb >= 9 && p.ramGb <= 16)).toBe(true);
  });

  it("filters by storage range", () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { ...EMPTY_FILTERS, storageMin: 257, storageMax: 512 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.storageGb >= 257 && p.storageGb <= 512)).toBe(true);
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

describe("paginate", () => {
  const items = Array.from({ length: 50 }, (_, i) => i);

  it("slices to the requested page and reports real totals", () => {
    const result = paginate(items, 1, 24);
    expect(result.items).toHaveLength(24);
    expect(result.items[0]).toBe(0);
    expect(result.totalCount).toBe(50);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(1);
  });

  it("returns the last partial page correctly", () => {
    const result = paginate(items, 3, 24);
    expect(result.items).toEqual([48, 49]);
  });

  it("clamps an out-of-range page down to the last real page", () => {
    const result = paginate(items, 99, 24);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([48, 49]);
  });

  it("clamps page 0 or negative up to page 1", () => {
    expect(paginate(items, 0, 24).page).toBe(1);
    expect(paginate(items, -5, 24).page).toBe(1);
  });

  it("always reports at least 1 total page, even for an empty list", () => {
    const result = paginate([], 1, 24);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});

describe("parseCatalogSearchParams", () => {
  it("defaults to no filters, featured sort, and page 1 when nothing is given", () => {
    const { filters, sort, page } = parseCatalogSearchParams({});
    expect(filters).toEqual({
      compatibility: [],
      priceMin: null,
      priceMax: null,
      brand: null,
      ramMin: null,
      ramMax: null,
      storageMin: null,
      storageMax: null,
    });
    expect(sort).toBe("featured");
    expect(page).toBe(1);
  });

  it("reads a single brand and repeated compat params", () => {
    const { filters } = parseCatalogSearchParams({ brand: "Dell", compat: ["Windows", "ChromeOS"] });
    expect(filters.brand).toBe("Dell");
    expect(filters.compatibility).toEqual(["Windows", "ChromeOS"]);
  });

  it("reads a single repeated-key compat param as a one-item list", () => {
    const { filters } = parseCatalogSearchParams({ compat: "Windows" });
    expect(filters.compatibility).toEqual(["Windows"]);
  });

  it("parses numeric range params, ignoring invalid values", () => {
    const { filters } = parseCatalogSearchParams({ priceMin: "10000", priceMax: "not-a-number" });
    expect(filters.priceMin).toBe(10000);
    expect(filters.priceMax).toBeNull();
  });

  it("falls back to featured for an unrecognized sort value", () => {
    expect(parseCatalogSearchParams({ sort: "bogus" }).sort).toBe("featured");
    expect(parseCatalogSearchParams({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("parses the page number, defaulting invalid/missing values to 1", () => {
    expect(parseCatalogSearchParams({ page: "4" }).page).toBe(4);
    expect(parseCatalogSearchParams({ page: "not-a-number" }).page).toBe(1);
    expect(parseCatalogSearchParams({ page: "-3" }).page).toBe(1);
  });
});

describe("buildCatalogQueryString", () => {
  const EMPTY_FILTERS: ProductFilters = {
    compatibility: [],
    priceMin: null,
    priceMax: null,
    brand: null,
    ramMin: null,
    ramMax: null,
    storageMin: null,
    storageMax: null,
  };

  it("produces an empty string for the default state", () => {
    expect(buildCatalogQueryString({ filters: EMPTY_FILTERS, sort: "featured" })).toBe("");
  });

  it("round-trips through parseCatalogSearchParams", () => {
    const filters: ProductFilters = { ...EMPTY_FILTERS, brand: "Dell", compatibility: ["Windows", "macOS"], ramMin: 8 };
    const qs = buildCatalogQueryString({ filters, sort: "price-asc", page: 2 });

    const parsed = parseCatalogSearchParams(Object.fromEntries(new URLSearchParams(qs).entries()));
    // URLSearchParams collapses repeated keys under Object.fromEntries, so
    // reparse via the real multi-value API for the compatibility list.
    const params = new URLSearchParams(qs);
    expect(params.getAll("compat")).toEqual(["Windows", "macOS"]);
    expect(parsed.filters.brand).toBe("Dell");
    expect(parsed.filters.ramMin).toBe(8);
    expect(parsed.sort).toBe("price-asc");
    expect(parsed.page).toBe(2);
  });

  it("omits page when it's 1 (the default)", () => {
    const qs = buildCatalogQueryString({ filters: EMPTY_FILTERS, sort: "featured", page: 1 });
    expect(qs).not.toContain("page");
  });
});
