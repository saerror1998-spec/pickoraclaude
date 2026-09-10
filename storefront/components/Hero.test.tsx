import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the full headline for screen readers", () => {
    render(<Hero />);
    expect(screen.getByText("Smarter laptops.", { selector: ".sr-only" })).toBeInTheDocument();
    expect(screen.getByText("Better value.", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("renders the subheading and both CTAs", () => {
    render(<Hero />);
    expect(screen.getByText(/Discover carefully selected refurbished Dell, HP and Lenovo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shop Laptops/ })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: "Explore Dell, HP & Lenovo" })).toHaveAttribute("href", "/shop");
  });

  it("wraps the headline in a real h1 for document structure", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("does not render catalog-derived stat cards when no counts are given", () => {
    render(<Hero />);
    expect(screen.queryByText("Laptops available")).not.toBeInTheDocument();
    expect(screen.queryByText("Available brands")).not.toBeInTheDocument();
  });

  it("shows real catalog-derived counts when given", () => {
    render(<Hero productCount={123} brandCount={3} />);
    expect(screen.getByText("123+")).toBeInTheDocument();
    expect(screen.getByText("Laptops available")).toBeInTheDocument();
    expect(screen.getByText("Dell · HP · Lenovo")).toBeInTheDocument();
  });
});
