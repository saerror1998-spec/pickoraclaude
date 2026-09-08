"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type ScrollRevealProps = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /**
   * true: animate in immediately on mount (for above-the-fold content like
   * the hero headline, which is never scrolled into view).
   * false (default): animate in once the element scrolls into view, for
   * below-the-fold section headlines.
   */
  immediate?: boolean;
};

const EASE_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const lineVariants: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 0.8, delay: i * 0.08, ease: EASE_EXPO_OUT },
  }),
};

const instantVariants: Variants = {
  hidden: { y: "0%" },
  visible: { y: "0%" },
};

/**
 * Headline reveal: each line is masked with overflow:hidden and staggers in
 * via translateY, either immediately on mount or once the element scrolls
 * into view (tracked with a plain IntersectionObserver rather than Framer's
 * whileInView, which was unreliable for already-in-view elements in testing).
 * Falls back to an instant, unanimated render when the user prefers reduced
 * motion.
 */
export function ScrollReveal({ lines, as = "h2", className = "", immediate = false }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(immediate);
  const Tag = as;
  const variants = shouldReduceMotion ? instantVariants : lineVariants;

  useEffect(() => {
    if (immediate || !containerRef.current) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } catch (error) {
      console.error("ScrollReveal: IntersectionObserver setup failed", error);
      // Defer so the browsers-without-IntersectionObserver fallback doesn't
      // set state synchronously within the effect body.
      const timer = setTimeout(() => setIsInView(true), 0);
      return () => clearTimeout(timer);
    }
  }, [immediate]);

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className="reveal-line">
            <motion.span
              custom={i}
              variants={variants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}
