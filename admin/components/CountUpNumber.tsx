"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Animates a numeric value from 0 up to `value` on mount. `format` renders
 * the animated number (still a number) into its final display string, so
 * callers can reuse formatters like formatPrice/toLocaleString mid-animation.
 */
export function CountUpNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  duration = 1.1,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
    </span>
  );
}
