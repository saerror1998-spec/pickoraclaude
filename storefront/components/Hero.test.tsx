import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

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

  it("shows a plain placeholder card when no product is given", () => {
    render(<Hero />);
    expect(screen.getByText("Certified refurbished laptops")).toBeInTheDocument();
  });

  it("shows the real featured product's name, price, and a link to its page", () => {
    const product = SAMPLE_PRODUCTS[0];
    render(<Hero product={product} />);

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(product.name) })).toHaveAttribute(
      "href",
      `/products/${product.slug}`
    );
  });

  it("shows a real save badge only when the product actually has a discount", () => {
    const discounted = SAMPLE_PRODUCTS[0];
    const { rerender } = render(<Hero product={discounted} />);
    expect(screen.getByText(/Save \d+%/)).toBeInTheDocument();

    rerender(<Hero product={{ ...discounted, originalPriceCents: null }} />);
    expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
  });
});
