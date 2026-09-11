"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import type { Product } from "@/lib/types";

/**
 * Sits below a product card's price. Starts as a plain "Add to Cart" pill;
 * once the product actually has a quantity in the cart, it morphs into a
 * live −/qty/+ stepper wired to the real cart (not a decorative hover-only
 * swap) — the stepper reflects real state, so it stays correct on touch
 * devices too, where there's no hover to trigger a cosmetic-only swap.
 */
export function ProductCardCartControl({ product }: { product: Product }) {
  const { items, addItem, setQuantity } = useCart();
  const { user, loading, signInWithGoogle } = useAuth();
  const pathname = usePathname();
  const [signingIn, setSigningIn] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;

  async function requireSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle(pathname);
    } catch {
      setSigningIn(false);
    }
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return requireSignIn();
    addItem(
      { productId: product.id, slug: product.slug, name: product.name, image: product.image, priceCents: product.priceCents },
      1
    );
  }

  function handleStep(e: React.MouseEvent, delta: number) {
    e.preventDefault();
    setQuantity(product.id, quantity + delta);
  }

  if (!product.inStock) return null;

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading || signingIn}
        className="mt-3 w-full rounded-full bg-glass-zinc py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-glass-violet disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!user && !loading ? "Sign in to add" : "Add to Cart"}
      </button>
    );
  }

  return (
    <div className="mt-3 flex w-full items-center justify-center gap-4 rounded-full bg-glass-zinc py-1.5 text-white">
      <button
        type="button"
        onClick={(e) => handleStep(e, -1)}
        aria-label={`Decrease quantity of ${product.name}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-white/15"
      >
        −
      </button>
      <span className="min-w-4 text-center text-sm font-medium tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={(e) => handleStep(e, 1)}
        aria-label={`Increase quantity of ${product.name}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-white/15"
      >
        +
      </button>
    </div>
  );
}
