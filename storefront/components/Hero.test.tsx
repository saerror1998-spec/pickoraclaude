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
});
