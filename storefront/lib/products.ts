import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "./supabase/client";
import { SAMPLE_PRODUCTS } from "./sample-data";
import type { Product, ProductFilters, SortOption } from "./types";

// Every dynamic page (/, /shop, /brands/[brand], /laptops-under-500-aed)
// calls fetchProducts() and was re-fetching the full ~1200-row catalog from
// Supabase — two paginated round trips — on every single request. Caching
// this at the data layer (rather than making the pages themselves static,
// which doesn't play well with /shop's searchParams-driven filtering) means
// only one request per CACHE_SECONDS window actually hits Supabase; every
// other request in that window is served from Next's data cache. Stock/price
// can be up to CACHE_SECONDS stale — an ordinary, acceptable ecommerce
// tradeoff for a large latency win.
const CACHE_SECONDS = 60;

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
const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabaseClient();
    if (!supabase) return SAMPLE_PRODUCTS;

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
  },
  ["product-catalog"],
  { revalidate: CACHE_SECONDS, tags: ["products"] }
);

export async function fetchProducts(): Promise<Product[]> {
  try {
    return await getCachedProducts();
  } catch (cause) {
    throw new ProductFetchError("Failed to load products from Supabase", cause);
  }
}

/**
 * Fetches a single product by slug for the product detail page. Returns
 * null when not found (including when Supabase isn't configured, unless the
 * slug matches a sample product, so the PDP stays demoable too).
 */
const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null;

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapRow(data as ProductRow);
  },
  ["product-by-slug"],
  { revalidate: CACHE_SECONDS, tags: ["products"] }
);

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await getCachedProductBySlug(slug);
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
    if (filters.ramMin != null && product.ramGb < filters.ramMin) return false;
    if (filters.ramMax != null && product.ramGb > filters.ramMax) return false;
    if (filters.storageMin != null && product.storageGb < filters.storageMin) return false;
    if (filters.storageMax != null && product.storageGb > filters.storageMax) return false;
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

// Rendering the full catalog (up to ~1200 products) into one page was
// producing multi-megabyte HTML responses and made every catalog page feel
// slow to open — see PAGE_SIZE-based slicing below and the server-driven
// filters in CatalogSection.
export const CATALOG_PAGE_SIZE = 24;

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export function paginate<T>(items: T[], page: number, pageSize = CATALOG_PAGE_SIZE): Paginated<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages, totalCount };
}

type SearchParamValue = string | string[] | undefined;

function toSingle(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toList(value: SearchParamValue): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Reads the catalog's filter/sort/page state from a page's `searchParams` — the single source of truth for what's shown, instead of client-only React state. */
export function parseCatalogSearchParams(searchParams: Record<string, SearchParamValue>): {
  filters: ProductFilters;
  sort: SortOption;
  page: number;
} {
  const filters: ProductFilters = {
    compatibility: toList(searchParams.compat),
    priceMin: toNumber(toSingle(searchParams.priceMin)),
    priceMax: toNumber(toSingle(searchParams.priceMax)),
    brand: toSingle(searchParams.brand) || null,
    ramMin: toNumber(toSingle(searchParams.ramMin)),
    ramMax: toNumber(toSingle(searchParams.ramMax)),
    storageMin: toNumber(toSingle(searchParams.storageMin)),
    storageMax: toNumber(toSingle(searchParams.storageMax)),
  };

  const sortParam = toSingle(searchParams.sort);
  const sort: SortOption = (["price-asc", "price-desc", "newest", "featured"] as const).includes(
    sortParam as SortOption
  )
    ? (sortParam as SortOption)
    : "featured";

  const page = Math.max(1, toNumber(toSingle(searchParams.page)) ?? 1);

  return { filters, sort, page };
}

/** Inverse of parseCatalogSearchParams — builds the query string for a link/navigation reflecting a given filter/sort/page state. Omits keys at their default so URLs stay clean. */
export function buildCatalogQueryString(state: { filters: ProductFilters; sort: SortOption; page?: number }): string {
  const params = new URLSearchParams();
  const { filters, sort, page } = state;

  if (filters.brand) params.set("brand", filters.brand);
  for (const c of filters.compatibility) params.append("compat", c);
  if (filters.priceMin != null) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax != null) params.set("priceMax", String(filters.priceMax));
  if (filters.ramMin != null) params.set("ramMin", String(filters.ramMin));
  if (filters.ramMax != null) params.set("ramMax", String(filters.ramMax));
  if (filters.storageMin != null) params.set("storageMin", String(filters.storageMin));
  if (filters.storageMax != null) params.set("storageMax", String(filters.storageMax));
  if (sort !== "featured") params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));

  return params.toString();
}

export function formatPrice(cents: number): string {
  const currency = process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}
