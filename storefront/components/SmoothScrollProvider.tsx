"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Wires Lenis smooth scroll to GSAP's ScrollTrigger so scroll-driven
 * animations stay in sync with the smoothed scroll position. Disabled
 * entirely when the user has requested reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    try {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef.current = null;
      };
    } catch (error) {
      console.error("SmoothScrollProvider: failed to initialize Lenis/GSAP", error);
      return undefined;
    }
  }, []);

  return <>{children}</>;
}
