export const COMPATIBILITY_OPTIONS = ["Windows", "macOS", "ChromeOS"] as const;

// Bounds only — labels are rendered with formatPrice() in FilterSidebar so
// they always reflect the real store currency (NEXT_PUBLIC_STORE_CURRENCY),
// not a hardcoded "$".
export const PRICE_RANGES = [
  { min: null, max: 100000 },
  { min: 100000, max: 250000 },
  { min: 250000, max: 500000 },
  { min: 500000, max: null },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
] as const;
