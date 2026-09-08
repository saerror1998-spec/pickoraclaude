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
        disabled={loading || signingIn}
        className="w-full rounded-[var(--radius-pill)] border border-ink px-8 py-3 text-sm font-medium text-ink transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {justAdded ? "Added to cart ✓" : !user && !loading ? "Sign in to add to cart" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={loading || signingIn}
        className="w-full rounded-[var(--radius-pill)] bg-ink px-8 py-3 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
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
