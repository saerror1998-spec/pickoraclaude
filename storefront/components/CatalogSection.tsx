"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { filterProducts, sortProducts } from "@/lib/products";
import type { Product, ProductFilters, SortOption } from "@/lib/types";

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

export function CatalogSection({
  products,
  initialBrand = null,
}: {
  products: Product[];
  /** Pre-selects a brand filter, e.g. when arriving from a Shop by Brand tile (?brand=Dell). */
  initialBrand?: string | null;
}) {
  const [filters, setFilters] = useState<ProductFilters>({ ...EMPTY_FILTERS, brand: initialBrand });
  const [sort, setSort] = useState<SortOption>("featured");

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort]
  );

  return (
    <section id="catalog" className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} brands={brands} />
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-taupe">
                {visibleProducts.length} laptop{visibleProducts.length === 1 ? "" : "s"}
              </p>
              {filters.brand && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, brand: null })}
                  className="flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-ink px-3 py-1 text-xs font-medium text-white"
                >
                  {filters.brand}
                  <span aria-hidden>×</span>
                  <span className="sr-only">Clear brand filter</span>
                </button>
              )}
            </div>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          <div className="lg:hidden mb-6">
            <FilterSidebar filters={filters} onChange={setFilters} brands={brands} compact />
          </div>

          {visibleProducts.length === 0 ? (
            <div className="rounded-[var(--radius-card)] bg-white p-12 text-center text-taupe shadow-[var(--shadow-soft)]">
              No laptops match those filters yet. Try widening your price range or compatibility.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-[var(--gutter-desktop)]">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
