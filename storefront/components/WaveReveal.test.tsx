import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WaveReveal } from "./WaveReveal";

describe("WaveReveal", () => {
  it("renders nothing for empty text", () => {
    const { container } = render(<WaveReveal text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes the full sentence to screen readers via a single sr-only span", () => {
    render(<WaveReveal text="Ask more of your laptop." />);
    const srOnly = screen.getByText("Ask more of your laptop.", { selector: ".sr-only" });
    expect(srOnly).toBeInTheDocument();
  });

  it("gives every word but the last a margin, instead of a separate space element", () => {
    // Not a nested-space bug guard so much as a minifier-safety guard: an
    // earlier version used a sibling space/NBSP span between words, which
    // Next's production HTML minifier silently merged into the preceding
    // word span (it doesn't know inline-block + whitespace-nowrap makes
    // element boundaries load-bearing here) — a margin can't be merged away.
    const { container } = render(<WaveReveal text="Hi there" />);
    const hiddenWrapper = container.querySelector("[aria-hidden]");
    const wordSpans = Array.from(hiddenWrapper?.children ?? []);

    expect(wordSpans).toHaveLength(2);
    expect(wordSpans[0]).toHaveClass("mr-[0.28em]");
    expect(wordSpans[1]).not.toHaveClass("mr-[0.28em]");
  });

  it("hides the broken-up visible letters from assistive tech", () => {
    const { container } = render(<WaveReveal text="Hi" />);
    const hiddenWrapper = container.querySelector("[aria-hidden]");
    expect(hiddenWrapper).toBeInTheDocument();
    expect(hiddenWrapper?.textContent).toBe("Hi");
  });

  it("renders the root element as the given tag", () => {
    const { container } = render(<WaveReveal as="span" text="Hi" className="my-class" />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("SPAN");
    expect(root).toHaveClass("my-class");
  });

  it("stages each letter's animation-delay so later letters start later", () => {
    const { container } = render(<WaveReveal text="Hi" />);
    const letters = container.querySelectorAll("[aria-hidden] > span > span");
    expect(letters).toHaveLength(2);
    const delays = Array.from(letters).map((el) => (el as HTMLElement).style.animationDelay);
    expect(delays[0]).toBe("0ms");
    expect(delays[1]).toBe("40ms");
  });
});
