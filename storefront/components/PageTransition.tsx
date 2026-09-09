"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * Full-viewport split-shutter transition that plays on every route change
 * (including the very first page load). Two panels start covering the
 * screen; a moment after the pathname changes, they slide apart to reveal
 * the new page underneath. Because this lives once in the root layout, it
 * survives client-side navigations and also naturally replays on hard
 * navigations (e.g. returning from Nomod's hosted checkout), which is fine
 * — it's brief and non-blocking, not something that should interfere with
 * the checkout flow.
 */
export function PageTransition() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(shouldReduceMotion ?? false);

  useEffect(() => {
    if (shouldReduceMotion) {
      const timer = setTimeout(() => setRevealed(true), 0);
      return () => clearTimeout(timer);
    }

    // Both deferred (rather than the first firing synchronously) so the
    // covered frame actually paints before the reveal animation starts —
    // otherwise the browser can coalesce both updates into one frame and
    // skip the "covered" moment entirely.
    const coverTimer = setTimeout(() => setRevealed(false), 0);
    const revealTimer = setTimeout(() => setRevealed(true), 20);
    return () => {
      clearTimeout(coverTimer);
      clearTimeout(revealTimer);
    };
  }, [pathname, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden
      data-page-transition-overlay
      data-phase={revealed ? "reveal" : "covered"}
      className={`fixed inset-0 z-[100] ${revealed ? "pointer-events-none" : ""}`}
    >
      <div data-page-transition-shutter="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-page-transition-shutter="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
    </div>
  );
}
