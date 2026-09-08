"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { CartItem } from "@/lib/cart-types";

export function AddToCartButton({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-3 text-sm text-taupe">
        Quantity
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded-[var(--radius-pill)] border border-taupe-light/40 bg-white px-3 py-1.5 text-sm text-ink focus-visible:outline-none"
        >
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full rounded-[var(--radius-pill)] border border-ink px-8 py-3 text-sm font-medium text-ink transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
      >
        {justAdded ? "Added to cart ✓" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        className="w-full rounded-[var(--radius-pill)] bg-ink px-8 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
      >
        Buy Now
      </button>
    </div>
  );
}
