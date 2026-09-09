"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "./Card";
import type { ProductFormState } from "@/lib/actions/products";
import type { AdminProductDetail } from "@/lib/types";

const CONDITIONS = ["Excellent", "Good", "Fair"] as const;
const COMPATIBILITY_OPTIONS = ["Windows", "macOS", "ChromeOS"] as const;

const inputClass =
  "w-full rounded-[var(--radius-card-sm)] border border-card-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline-none";
const labelClass = "flex flex-col gap-1.5 text-sm text-text-muted";

export function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial?: AdminProductDetail;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <label className={labelClass}>
          Name
          <input name="name" type="text" required defaultValue={initial?.name} className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Brand
            <input name="brand" type="text" required defaultValue={initial?.brand} className={inputClass} />
          </label>
          <label className={labelClass}>
            Processor
            <input name="processor" type="text" required defaultValue={initial?.processor} className={inputClass} />
          </label>
        </div>

        <label className={labelClass}>
          Image URL
          <input name="image" type="url" required defaultValue={initial?.image} className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            RAM (GB)
            <input
              name="ramGb"
              type="number"
              min="1"
              required
              defaultValue={initial?.ramGb}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Storage (GB)
            <input
              name="storageGb"
              type="number"
              min="1"
              required
              defaultValue={initial?.storageGb}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={initial ? initial.priceCents / 100 : undefined}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Original price (optional — shows as a strikethrough discount)
            <input
              name="originalPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial?.originalPriceCents != null ? initial.originalPriceCents / 100 : undefined}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Condition
            <select name="condition" required defaultValue={initial?.condition ?? ""} className={inputClass}>
              <option value="" disabled>
                Select condition
              </option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            SKU (optional)
            <input name="sku" type="text" defaultValue={initial?.sku ?? ""} className={inputClass} />
          </label>
        </div>

        <label className={labelClass}>
          Spec text (optional — shown instead of the parsed processor/RAM/storage line, e.g. &quot;8GB / 256GB / i3 10th Gen&quot;)
          <input name="specText" type="text" defaultValue={initial?.specText ?? ""} className={inputClass} />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm text-text-muted">Compatibility</legend>
          <div className="flex flex-wrap gap-4">
            {COMPATIBILITY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  name="compatibility"
                  value={option}
                  defaultChecked={initial?.compatibility.includes(option) ?? false}
                  className="h-4 w-4 accent-accent"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" name="inStock" defaultChecked={initial?.inStock ?? true} className="h-4 w-4 accent-accent" />
          In stock
        </label>
      </Card>

      {state.error && (
        <p role="alert" className="text-sm text-negative">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-pill)] bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform duration-150 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/products" className="text-sm text-text-muted hover:text-text">
          Cancel
        </Link>
      </div>
    </form>
  );
}
