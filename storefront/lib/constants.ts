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

// Bucketed rather than exposing every raw ram_gb/storage_gb value — the
// source CSV's free-text specs parse imperfectly (a handful of rows have a
// storage value like 256 or 512 land in ram_gb), so a handful of odd
// outliers just fall into the nearest bucket instead of showing up as their
// own nonsensical filter option (e.g. "512GB RAM").
export const RAM_RANGES = [
  { label: "4GB", min: null, max: 4 },
  { label: "8GB", min: 5, max: 8 },
  { label: "16GB", min: 9, max: 16 },
  { label: "32GB+", min: 17, max: null },
] as const;

export const STORAGE_RANGES = [
  { label: "Up to 128GB", min: null, max: 128 },
  { label: "256GB", min: 129, max: 256 },
  { label: "512GB", min: 257, max: 512 },
  { label: "1TB+", min: 513, max: null },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
] as const;
