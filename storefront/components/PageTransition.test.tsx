import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { PageTransition } from "./PageTransition";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("PageTransition", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("starts covered, then reveals shortly after mount", async () => {
    const { container } = render(<PageTransition />);
    const overlay = container.querySelector("[data-page-transition-overlay]");
    expect(overlay).toHaveAttribute("data-phase", "covered");

    await waitFor(() => expect(overlay).toHaveAttribute("data-phase", "reveal"));
  });

  it("stops blocking pointer events once revealed", async () => {
    const { container } = render(<PageTransition />);
    const overlay = container.querySelector("[data-page-transition-overlay]");

    await waitFor(() => expect(overlay).toHaveAttribute("data-phase", "reveal"));
    expect(overlay?.className).toContain("pointer-events-none");
  });

  it("re-covers and reveals again when the route changes", async () => {
    const { container, rerender } = render(<PageTransition />);
    const overlay = () => container.querySelector("[data-page-transition-overlay]");

    await waitFor(() => expect(overlay()).toHaveAttribute("data-phase", "reveal"));

    mockPathname = "/products/thinkpad-x1";
    rerender(<PageTransition />);

    await waitFor(() => expect(overlay()).toHaveAttribute("data-phase", "reveal"));
  });

  it("renders two shutter panels", () => {
    const { container } = render(<PageTransition />);
    expect(container.querySelector('[data-page-transition-shutter="top"]')).toBeInTheDocument();
    expect(container.querySelector('[data-page-transition-shutter="bottom"]')).toBeInTheDocument();
  });
});
