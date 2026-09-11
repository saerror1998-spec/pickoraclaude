import type { Product } from "@/lib/types";

/**
 * Read-only spec highlights, not selectable variant pills — each listing is
 * one fixed configuration (a specific RAM/storage/processor combo is its own
 * catalog row and slug), so there's no real "choose your RAM" toggle to
 * offer on this page without linking out to a different product.
 */
export function ProductSpecPills({ product }: { product: Product }) {
  const specs = [
    product.processor,
    `${product.ramGb}GB RAM`,
    `${product.storageGb}GB storage`,
    ...product.compatibility,
  ].filter(Boolean);

  if (specs.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-sm text-taupe">Specifications</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {specs.map((spec) => (
          <li
            key={spec}
            className="rounded-[var(--radius-pill)] border border-ink/10 bg-cream-warm px-4 py-2 text-sm text-ink"
          >
            {spec}
          </li>
        ))}
      </ul>
    </div>
  );
}
