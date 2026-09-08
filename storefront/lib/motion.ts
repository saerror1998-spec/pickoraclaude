export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const EASE_EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
