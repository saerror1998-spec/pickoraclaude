"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { filterProducts, sortProducts } from "@/lib/products";
import type { Product, ProductFilters, SortOption } from "@/lib/types";

const EMPTY_FILTERS: ProductFilters = { compatibility: [], priceMin: null, priceMax: null };

export function CatalogSection({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");

  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort]
  );

  return (
    <section id="catalog" className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-taupe">
              {visibleProducts.length} laptop{visibleProducts.length === 1 ? "" : "s"}
            </p>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          <div className="lg:hidden mb-6">
            <FilterSidebar filters={filters} onChange={setFilters} compact />
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
