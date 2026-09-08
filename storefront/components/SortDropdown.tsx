"use client";

import { SORT_OPTIONS } from "@/lib/constants";
import type { SortOption } from "@/lib/types";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-taupe">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-[var(--radius-pill)] border border-taupe-light/40 bg-white px-4 py-2 text-sm text-ink focus-visible:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
