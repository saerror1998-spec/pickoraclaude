import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

describe("ProductCard", () => {
  it("renders name, spec line, and current price", () => {
    const product = SAMPLE_PRODUCTS[0];
    render(<ProductCard product={product} />);

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(product.processor))).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
  });

  it("shows a strikethrough original price and save badge when discounted", () => {
    const product = SAMPLE_PRODUCTS[0];
    render(<ProductCard product={product} />);

    expect(screen.getByText("$1,499")).toBeInTheDocument();
    expect(screen.getByText(/Save \d+%/)).toBeInTheDocument();
  });

  it("does not render a save badge when there is no discount", () => {
    const product = { ...SAMPLE_PRODUCTS[0], originalPriceCents: null };
    render(<ProductCard product={product} />);

    expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
  });

  it("shows a sold out badge for out-of-stock products", () => {
    const product = { ...SAMPLE_PRODUCTS[0], inStock: false };
    render(<ProductCard product={product} />);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("links to the product detail page", () => {
    const product = SAMPLE_PRODUCTS[0];
    render(<ProductCard product={product} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", `/products/${product.slug}`);
  });
});
