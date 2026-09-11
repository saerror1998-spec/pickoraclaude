import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromoBanner } from "./PromoBanner";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

describe("PromoBanner", () => {
  it("renders nothing when there are no in-stock products", () => {
    const { container } = render(<PromoBanner products={[{ ...base, inStock: false }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the real highest-priced in-stock product's photo and links to /shop", () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Cheap One", priceCents: 50000, inStock: true },
      { ...base, id: "2", name: "Premium One", priceCents: 500000, inStock: true },
      { ...base, id: "3", name: "Out of stock premium", priceCents: 900000, inStock: false },
    ];
    render(<PromoBanner products={products} />);

    expect(screen.getByAltText("Premium One")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shop Laptops/ })).toHaveAttribute("href", "/shop");
  });

  it("only makes the real, already-verified 90-day warranty claim", () => {
    render(<PromoBanner products={[{ ...base, inStock: true }]} />);
    expect(screen.getByText(/90-Day Warranty/)).toBeInTheDocument();
  });
});
