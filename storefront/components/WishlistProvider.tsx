"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { WishlistItem } from "@/lib/wishlist-types";

const STORAGE_KEY = "pickora-wishlist";

type WishlistContextValue = {
  items: WishlistItem[];
  itemCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("WishlistProvider: failed to read wishlist from localStorage", error);
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Same pattern as CartProvider: starts empty on the server and on first
  // client render to avoid a hydration mismatch, then fills in from
  // localStorage right after mount.
  useEffect(() => {
    queueMicrotask(() => {
      setItems(readStoredWishlist());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("WishlistProvider: failed to save wishlist to localStorage", error);
    }
  }, [items, hydrated]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.some((i) => i.productId === item.productId);
      return exists ? current.filter((i) => i.productId !== item.productId) : [...current, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, itemCount: items.length, isWishlisted, toggleItem, removeItem }),
    [items, isWishlisted, toggleItem, removeItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
