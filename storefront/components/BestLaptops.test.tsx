import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BestLaptops } from "./BestLaptops";
import { WishlistProvider } from "./WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

function renderLaptops(products: Product[]) {
  return render(
    <WishlistProvider>
      <BestLaptops products={products} />
    </WishlistProvider>
  );
}

describe("BestLaptops", () => {
  it("renders nothing when no product is Excellent condition and in stock", () => {
    const products: Product[] = [
      { ...base, id: "1", condition: "Good", inStock: true },
      { ...base, id: "2", condition: "Excellent", inStock: false },
    ];
    const { container } = renderLaptops(products);
    expect(container).toBeEmptyDOMElement();
  });

  it("only includes Excellent-condition, in-stock products", () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Keep me", condition: "Excellent", inStock: true },
      { ...base, id: "2", name: "Wrong condition", condition: "Good", inStock: true },
      { ...base, id: "3", name: "Sold out", condition: "Excellent", inStock: false },
    ];
    renderLaptops(products);

    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.queryByText("Wrong condition")).not.toBeInTheDocument();
    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("caps the list at 8 products — a curated row, not the whole catalog", () => {
    const products: Product[] = Array.from({ length: 75 }, (_, i) => ({
      ...base,
      id: `p${i}`,
      slug: `p${i}`,
      name: `Product ${i}`,
      condition: "Excellent",
      inStock: true,
    }));
    renderLaptops(products);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
  });

  it("links to /shop to see the full catalog", () => {
    const products: Product[] = [{ ...base, id: "1", condition: "Excellent", inStock: true }];
    renderLaptops(products);

    expect(screen.getByRole("link", { name: /View all laptops/ })).toHaveAttribute("href", "/shop");
  });
});
