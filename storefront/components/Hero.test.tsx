import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the full headline for screen readers", () => {
    render(<Hero />);
    expect(screen.getByText("Ask more of", { selector: ".sr-only" })).toBeInTheDocument();
    expect(screen.getByText("your laptop.", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("renders the subheading and both CTAs", () => {
    render(<Hero />);
    expect(screen.getByText(/Premium laptops, professionally inspected/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Laptops" })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: "Learn about our warranty" })).toHaveAttribute("href", "/warranty");
  });

  it("wraps the headline in a real h1 for document structure", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows the first trust-point step card by default", () => {
    render(<Hero />);
    expect(screen.getByText("90-day warranty.")).toBeInTheDocument();
    expect(screen.getByText("01 / 04")).toBeInTheDocument();
  });

  it("renders every given product image", () => {
    const images = ["/a.jpg", "/b.jpg", "/c.jpg"];
    render(<Hero images={images} />);
    const srcs = screen.getAllByRole("presentation", { hidden: true }).map((img) => img.getAttribute("src"));
    for (const src of images) {
      expect(srcs.some((s) => s?.includes(encodeURIComponent(src)))).toBe(true);
    }
  });
});
