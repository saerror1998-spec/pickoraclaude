"use client";

import { useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { Pagination } from "./Pagination";
import { buildCatalogQueryString } from "@/lib/products";
import type { Product, ProductFilters, SortOption } from "@/lib/types";

/**
 * Renders one already-filtered, already-paginated page of products, and
 * drives filter/sort/pagination changes through the URL (?brand=…&page=…)
 * rather than filtering a full in-memory catalog on the client — the
 * server (app/shop/page.tsx) does the filtering/sorting/slicing, so this
 * component only ever receives a page-sized slice (see lib/products.ts's
 * CATALOG_PAGE_SIZE), not the whole catalog.
 */
export function CatalogSection({
  products,
  brands,
  filters,
  sort,
  page,
  totalPages,
  totalCount,
}: {
  /** Current page's products only — not the full catalog. */
  products: Product[];
  brands: string[];
  filters: ProductFilters;
  sort: SortOption;
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  const router = useRouter();

  function navigate(next: { filters?: ProductFilters; sort?: SortOption; page?: number }) {
    const nextFilters = next.filters ?? filters;
    const nextSort = next.sort ?? sort;
    // Any filter/sort change resets to page 1 — staying on e.g. page 5 of a
    // newly-narrowed result set would often just show nothing.
    const nextPage = next.page ?? (next.filters || next.sort ? 1 : page);
    const qs = buildCatalogQueryString({ filters: nextFilters, sort: nextSort, page: nextPage });
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  }

  return (
    <section id="catalog" className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
      <h1 className="type-label-md text-ink">{filters.brand ? `${filters.brand} laptops` : "All laptops"}</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={(f) => navigate({ filters: f })} brands={brands} />
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-taupe">
                {totalCount} laptop{totalCount === 1 ? "" : "s"}
              </p>
              {filters.brand && (
                <button
                  type="button"
                  onClick={() => navigate({ filters: { ...filters, brand: null } })}
                  className="flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-ink px-3 py-1 text-xs font-medium text-white"
                >
                  {filters.brand}
                  <span aria-hidden>×</span>
                  <span className="sr-only">Clear brand filter</span>
                </button>
              )}
            </div>
            <SortDropdown value={sort} onChange={(s) => navigate({ sort: s })} />
          </div>

          <div className="lg:hidden mb-6">
            <FilterSidebar filters={filters} onChange={(f) => navigate({ filters: f })} brands={brands} compact />
          </div>

          {products.length === 0 ? (
            <div className="rounded-[var(--radius-card)] bg-white p-12 text-center text-taupe shadow-[var(--shadow-soft)]">
              No laptops match those filters yet. Try widening your price range or compatibility.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-[var(--gutter-desktop)]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => `/shop?${buildCatalogQueryString({ filters, sort, page: p })}`}
          />
        </div>
      </div>
    </section>
  );
}
