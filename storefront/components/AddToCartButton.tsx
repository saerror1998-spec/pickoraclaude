"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import type { CartItem } from "@/lib/cart-types";

export function AddToCartButton({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  async function requireSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle(pathname);
      // On success this navigates away to Google; signingIn only needs
      // resetting if starting the OAuth flow itself failed.
    } catch {
      setSigningIn(false);
    }
  }

  function handleAddToCart() {
    if (!user) return requireSignIn();
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!user) return requireSignIn();
    addItem(product, quantity);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm text-taupe">
        <span id="quantity-label">Quantity</span>
        <div
          role="group"
          aria-labelledby="quantity-label"
          className="flex items-center gap-4 rounded-[var(--radius-pill)] border border-taupe-light/40 bg-white px-2 py-1.5"
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-6 w-6 items-center justify-center rounded-full text-base leading-none text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-4 text-center text-sm font-medium tabular-nums text-ink">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(5, q + 1))}
            disabled={quantity >= 5}
            aria-label="Increase quantity"
            className="flex h-6 w-6 items-center justify-center rounded-full text-base leading-none text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart is the primary, filled CTA — the one action most buyers
          take — with Buy Now as a secondary outlined path straight to
          checkout, rather than the reverse. */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading || signingIn}
        className="w-full rounded-[var(--radius-pill)] bg-ink px-8 py-3.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {justAdded ? "Added to cart ✓" : !user && !loading ? "Sign in to add to cart" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={loading || signingIn}
        className="w-full rounded-[var(--radius-pill)] border border-ink px-8 py-3.5 text-sm font-medium text-ink transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!user && !loading ? "Sign in to buy now" : "Buy Now"}
      </button>

      {!user && !loading && (
        <p className="text-center text-xs text-taupe-light">
          We ask you to sign in with Google before adding to cart, so your order and checkout stay
          tied to your account.
        </p>
      )}
    </div>
  );
}
