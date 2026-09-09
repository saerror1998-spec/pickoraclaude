import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { HeroShaderBackground } from "./HeroShaderBackground";

// jsdom has no WebGL context, so this always exercises the static-gradient
// fallback path (the same path real browsers without WebGL, or with
// prefers-reduced-motion, take) — the animated <Canvas> path needs a real
// browser and isn't unit-tested here, matching how the admin app's recharts
// components aren't either.
describe("HeroShaderBackground", () => {
  it("falls back to a static CSS gradient when WebGL isn't available", () => {
    const { container } = render(<HeroShaderBackground color1="#0b0b0c" color2="#2b5cff" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toBeInTheDocument();
    // jsdom normalizes hex colors to rgb() in the computed style.
    expect(el.style.backgroundImage).toContain("rgb(11, 11, 12)");
    expect(el.style.backgroundImage).toContain("rgb(43, 92, 255)");
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<HeroShaderBackground />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden");
  });

  it("applies the given className to the background element", () => {
    const { container } = render(<HeroShaderBackground className="absolute inset-0" />);
    expect(container.firstElementChild).toHaveClass("absolute", "inset-0");
  });
});
