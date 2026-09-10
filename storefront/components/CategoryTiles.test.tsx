import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryTiles } from "./CategoryTiles";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

describe("CategoryTiles", () => {
  it("renders nothing when there are no products", () => {
    const { container } = render(<CategoryTiles products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a tile per brand with its real in-stock count, most common first", () => {
    const products: Product[] = [
      { ...base, id: "1", brand: "Dell", inStock: true },
      { ...base, id: "2", brand: "Dell", inStock: true },
      { ...base, id: "3", brand: "HP", inStock: true },
    ];
    render(<CategoryTiles products={products} />);

    expect(screen.getByText("Dell")).toBeInTheDocument();
    expect(screen.getByText("2 laptops")).toBeInTheDocument();
    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.getByText("1 laptop")).toBeInTheDocument();
  });

  it("links each brand tile to its real brand page", () => {
    const products: Product[] = [{ ...base, id: "1", brand: "Dell", inStock: true }];
    render(<CategoryTiles products={products} />);

    expect(screen.getByRole("link", { name: /Dell/ })).toHaveAttribute("href", "/brands/dell");
  });

  it("adds an Under 500 AED tile only when a real in-stock product qualifies", () => {
    const products: Product[] = [
      { ...base, id: "1", brand: "Dell", inStock: true, priceCents: 40000 },
      { ...base, id: "2", brand: "HP", inStock: true, priceCents: 90000 },
    ];
    render(<CategoryTiles products={products} />);

    expect(screen.getByRole("link", { name: /Under 500 AED/ })).toHaveAttribute(
      "href",
      "/laptops-under-500-aed"
    );
  });

  it("omits the Under 500 AED tile when nothing in stock qualifies", () => {
    const products: Product[] = [{ ...base, id: "1", brand: "Dell", inStock: true, priceCents: 90000 }];
    render(<CategoryTiles products={products} />);

    expect(screen.queryByText("Under 500 AED")).not.toBeInTheDocument();
  });
});
