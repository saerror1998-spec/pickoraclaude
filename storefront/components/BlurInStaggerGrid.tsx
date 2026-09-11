"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Wraps a row/grid of cards so each one blurs in and sharpens with a
 * staggered per-card delay once the container scrolls into view — plain
 * IntersectionObserver rather than Framer's whileInView (see ScrollReveal.tsx
 * for why: unreliable for elements already in view on mount in testing).
 * Falls back to an instant, unanimated render under prefers-reduced-motion.
 *
 * `as="ul"` renders each item as a <li> (for the existing horizontal-scroll
 * carousels, which are <ul><li> lists); `as="div"` (default) renders each
 * item as a plain grid cell <div>.
 */
export function BlurInStaggerGrid({
  children,
  className,
  itemClassName,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  as?: "div" | "ul";
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } catch (error) {
      console.error("BlurInStaggerGrid: IntersectionObserver setup failed", error);
      const timer = setTimeout(() => setIsInView(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const items = Children.toArray(children);
  const MotionItem = as === "ul" ? motion.li : motion.div;
  const Container = as === "ul" ? "ul" : "div";

  return (
    <Container ref={containerRef as never} className={className}>
      {items.map((child, i) => (
        <MotionItem
          key={i}
          className={itemClassName}
          initial={shouldReduceMotion ? undefined : { opacity: 0, filter: "blur(10px)" }}
          animate={isInView || shouldReduceMotion ? { opacity: 1, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.5, delay: i * 0.09, ease: EASE_EXPO_OUT }}
        >
          {child}
        </MotionItem>
      ))}
    </Container>
  );
}
