import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LoginBackgroundPaths } from "./LoginBackgroundPaths";

describe("LoginBackgroundPaths", () => {
  it("renders a decorative, aria-hidden SVG with no visible text content", () => {
    const { container } = render(<LoginBackgroundPaths position={1} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("aria-hidden");
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).toBe("");
  });
});
