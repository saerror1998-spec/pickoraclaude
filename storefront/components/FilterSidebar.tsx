"use client";

import { useState } from "react";
import { COMPATIBILITY_OPTIONS, PRICE_RANGES } from "@/lib/constants";
import { formatPrice } from "@/lib/products";
import type { ProductFilters } from "@/lib/types";

function rangeLabel(min: number | null, max: number | null): string {
  if (min == null) return `Under ${formatPrice(max ?? 0)}`;
  if (max == null) return `${formatPrice(min)}+`;
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

type FilterSidebarProps = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  compact?: boolean;
};

export function FilterSidebar({ filters, onChange, compact = false }: FilterSidebarProps) {
  const [open, setOpen] = useState(!compact);

  function toggleCompatibility(option: string) {
    const next = filters.compatibility.includes(option)
      ? filters.compatibility.filter((c) => c !== option)
      : [...filters.compatibility, option];
    onChange({ ...filters, compatibility: next });
  }

  function selectRange(min: number | null, max: number | null) {
    const isActive = filters.priceMin === min && filters.priceMax === max;
    onChange({ ...filters, priceMin: isActive ? null : min, priceMax: isActive ? null : max });
  }

  const body = (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">Compatibility</legend>
        <div className="space-y-2">
          {COMPATIBILITY_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-taupe">
              <input
                type="checkbox"
                checked={filters.compatibility.includes(option)}
                onChange={() => toggleCompatibility(option)}
                className="h-4 w-4 rounded border-taupe-light accent-[var(--color-accent)]"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">Price range</legend>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
            return (
              <button
                key={`${range.min}-${range.max}`}
                type="button"
                onClick={() => selectRange(range.min, range.max)}
                aria-pressed={isActive}
                className={`block w-full rounded-[var(--radius-card-secondary)] px-3 py-2 text-left text-sm transition-colors duration-200 ease-[var(--ease-expo-out)] ${
                  isActive ? "bg-ink text-white" : "bg-cream-warm text-taupe hover:bg-ink/5"
                }`}
              >
                {rangeLabel(range.min, range.max)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  if (!compact) {
    return <nav aria-label="Product filters">{body}</nav>;
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-medium text-ink"
      >
        Filters
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-4">{body}</div>}
    </div>
  );
}
