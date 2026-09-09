"use client";

import { useReducedMotion, motion } from "framer-motion";

type LoginBackgroundPathsProps = {
  position: number;
  className?: string;
};

/** Purely decorative animated line-art background — no content, no missing-asset problem. */
export function LoginBackgroundPaths({ position, className = "" }: LoginBackgroundPathsProps) {
  const shouldReduceMotion = useReducedMotion();

  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${
      312 - i * 5 * position
    } ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${
      470 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="h-full w-full text-ink" viewBox="0 0 696 316" fill="none">
        {paths.map((path) =>
          shouldReduceMotion ? (
            <path key={path.id} d={path.d} stroke="currentColor" strokeWidth={path.width} strokeOpacity={0.1 + path.id * 0.02} />
          ) : (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.1 + path.id * 0.02}
              initial={{ pathLength: 0.3, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0.2, 0.4, 0.2], pathOffset: [0, 1, 0] }}
              transition={{ duration: 20 + (path.id % 5) * 3, repeat: Infinity, ease: "linear" }}
            />
          )
        )}
      </svg>
    </div>
  );
}
