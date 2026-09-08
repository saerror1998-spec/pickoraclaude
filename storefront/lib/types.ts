export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  processor: string;
  ramGb: number;
  storageGb: number;
  priceCents: number;
  originalPriceCents: number | null;
  compatibility: ("Windows" | "macOS" | "ChromeOS")[];
  condition: "Excellent" | "Good" | "Fair";
  inStock: boolean;
  sku?: string;
  /** Raw source-catalog spec line (e.g. "8GB / 256GB / i3 10th Gen"), shown
   *  in place of the parsed processor/ram/storage line when present, since
   *  it's the original text and more reliable than the parsed fields. */
  specText?: string;
};

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export type ProductFilters = {
  compatibility: string[];
  priceMin: number | null;
  priceMax: number | null;
};
