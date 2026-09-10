import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

describe("Hero", () => {
  it("renders the full headline for screen readers", () => {
    render(<Hero />);
    expect(screen.getByText("Smarter laptops.", { selector: ".sr-only" })).toBeInTheDocument();
    expect(screen.getByText("Better value.", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("renders the subheading and CTA", () => {
    render(<Hero />);
    expect(screen.getByText(/Discover carefully selected refurbished Dell, HP and Lenovo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shop Laptops/ })).toHaveAttribute("href", "/shop");
  });

  it("wraps the headline in a real h1 for document structure", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("does not render the floating deal card when no product is given", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: new RegExp(SAMPLE_PRODUCTS[0].name) })).not.toBeInTheDocument();
  });

  it("shows the real featured product's name, price, and a link to its page in the deal card", () => {
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
