import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MoreToExplore } from "./MoreToExplore";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

describe("MoreToExplore", () => {
  it("renders nothing when there are no in-stock products", () => {
    const { container } = render(<MoreToExplore products={[{ ...base, inStock: false }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not claim personalization it can't back — labels itself honestly", () => {
    render(<MoreToExplore products={[{ ...base, inStock: true }]} />);

    expect(screen.getByText("More to explore")).toBeInTheDocument();
    expect(screen.queryByText(/just for you/i)).not.toBeInTheDocument();
  });

  it("caps at 6 real in-stock products and links each to its product page", () => {
    const products: Product[] = Array.from({ length: 10 }, (_, i) => ({
      ...base,
      id: `p${i}`,
      slug: `p${i}`,
      name: `Product ${i}`,
      inStock: true,
    }));
    render(<MoreToExplore products={products} />);

    expect(screen.getAllByRole("link").filter((l) => l.getAttribute("href")?.startsWith("/products/"))).toHaveLength(
      6
    );
  });
});
