"use client";

import { createElement, forwardRef, useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

type MagneticButtonProps = {
  as?: ElementType;
  href?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

/** A button/link that subtly follows the cursor, snapping back on mouse-leave. Inert under reduced motion. */
export const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps>(function MagneticButton(
  { as: Component = "button", className, children, ...props },
  forwardedRef
) {
  const localRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el || prefersReducedMotion()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.35, y: y * 0.35, scale: 1.04, ease: "power2.out", duration: 0.4 });
    };
    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, scale: 1, ease: "elastic.out(1, 0.4)", duration: 1 });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Rendered via createElement rather than JSX: TSX's polymorphic-component
  // type inference for a runtime-chosen `ElementType` is overly strict
  // (it can't resolve which props are valid without a concrete tag), so
  // JSX here would reject props like `href` even though they're fine for
  // the "a" element callers actually pass.
  return createElement(
    Component,
    {
      ref: (node: HTMLElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      className: cn("cursor-pointer", className),
      ...props,
    },
    children
  );
});
