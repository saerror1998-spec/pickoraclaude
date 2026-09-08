import { describe, expect, it, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "./motion";

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when the media query does not match", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns true when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    expect(prefersReducedMotion()).toBe(true);
  });
});
