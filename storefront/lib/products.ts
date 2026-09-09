import { getSupabaseClient } from "./supabase/client";
import { SAMPLE_PRODUCTS } from "./sample-data";
import type { Product, ProductFilters, SortOption } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  processor: string;
  ram_gb: number;
  storage_gb: number;
  price_cents: number;
  original_price_cents: number | null;
  compatibility: Product["compatibility"] | null;
  condition: Product["condition"];
  in_stock: boolean;
  sku: string | null;
  spec_text: string | null;
};

export class ProductFetchError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ProductFetchError";
  }
}

const PRODUCT_COLUMNS =
  "id, slug, name, brand, image, processor, ram_gb, storage_gb, price_cents, original_price_cents, compatibility, condition, in_stock, sku, spec_text";

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    image: row.image,
    processor: row.processor,
    ramGb: row.ram_gb,
    storageGb: row.storage_gb,
    priceCents: row.price_cents,
    originalPriceCents: row.original_price_cents,
    compatibility: row.compatibility ?? [],
    condition: row.condition,
    inStock: row.in_stock,
    sku: row.sku ?? undefined,
    specText: row.spec_text ?? undefined,
  };
}

/**
 * Fetches the product catalog from Supabase. Falls back to bundled sample
 * data when Supabase isn't configured (no env vars) so the storefront stays
 * demoable; a configured-but-failing request still throws ProductFetchError
 * so callers can render a real error state instead of silently faking data.
 */
export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_PRODUCTS;

  try {
    // Supabase/PostgREST caps a single request at 1000 rows by default —
    // page through with .range() so a catalog past that size isn't silently
    // truncated (this happened: 1202 real products loaded as 1000).
    const PAGE_SIZE = 1000;
    const allRows: ProductRow[] = [];
    let page = 0;
    while (true) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .order("name", { ascending: true })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as ProductRow[]));
      if (data.length < PAGE_SIZE) break;
      page++;
    }

    return allRows.map(mapRow);
  } catch (cause) {
    throw new ProductFetchError("Failed to load products from Supabase", cause);
  }
}

/**
 * Fetches a single product by slug for the product detail page. Returns
 * null when not found (including when Supabase isn't configured, unless the
 * slug matches a sample product, so the PDP stays demoable too).
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapRow(data as ProductRow);
  } catch (cause) {
    throw new ProductFetchError(`Failed to load product "${slug}" from Supabase`, cause);
  }
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (
      filters.compatibility.length > 0 &&
      !product.compatibility.some((c) => filters.compatibility.includes(c))
    ) {
      return false;
    }
    if (filters.priceMin != null && product.priceCents < filters.priceMin) return false;
    if (filters.priceMax != null && product.priceCents > filters.priceMax) return false;
    if (filters.brand != null && product.brand !== filters.brand) return false;
    return true;
  });
}

/** Discount percentage vs. original price, or null when there's no real discount. */
export function getSavePercent(product: Pick<Product, "priceCents" | "originalPriceCents">): number | null {
  return product.originalPriceCents && product.originalPriceCents > product.priceCents
    ? Math.round((1 - product.priceCents / product.originalPriceCents) * 100)
    : null;
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case "newest":
      return sorted.sort((a, b) => b.id.localeCompare(a.id));
    case "featured":
    default:
      return sorted;
  }
}

export function formatPrice(cents: number): string {
  const currency = process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}
