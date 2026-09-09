import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BestLaptops } from "./BestLaptops";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

describe("BestLaptops", () => {
  it("renders nothing when no product is Excellent condition and in stock", () => {
    const products: Product[] = [
      { ...base, id: "1", condition: "Good", inStock: true },
      { ...base, id: "2", condition: "Excellent", inStock: false },
    ];
    const { container } = render(<BestLaptops products={products} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("only includes Excellent-condition, in-stock products", () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Keep me", condition: "Excellent", inStock: true },
      { ...base, id: "2", name: "Wrong condition", condition: "Good", inStock: true },
      { ...base, id: "3", name: "Sold out", condition: "Excellent", inStock: false },
    ];
    render(<BestLaptops products={products} />);

    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.queryByText("Wrong condition")).not.toBeInTheDocument();
    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("caps the list at 60 products", () => {
    const products: Product[] = Array.from({ length: 75 }, (_, i) => ({
      ...base,
      id: `p${i}`,
      slug: `p${i}`,
      name: `Product ${i}`,
      condition: "Excellent",
      inStock: true,
    }));
    render(<BestLaptops products={products} />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(60);
  });

  it("links to /shop to see the full catalog", () => {
    const products: Product[] = [{ ...base, id: "1", condition: "Excellent", inStock: true }];
    render(<BestLaptops products={products} />);

    expect(screen.getByRole("link", { name: /View all laptops/ })).toHaveAttribute("href", "/shop");
  });
});
