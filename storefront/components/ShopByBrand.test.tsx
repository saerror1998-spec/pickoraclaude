import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShopByBrand } from "./ShopByBrand";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

describe("ShopByBrand", () => {
  it("renders nothing when there are no products", () => {
    const { container } = render(<ShopByBrand products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists distinct brands with their product counts, most common first", () => {
    const products: Product[] = [
      { ...base, id: "1", brand: "Dell" },
      { ...base, id: "2", brand: "Dell" },
      { ...base, id: "3", brand: "HP" },
    ];
    render(<ShopByBrand products={products} />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Dell");
    expect(links[0]).toHaveTextContent("2 laptops");
    expect(links[1]).toHaveTextContent("HP");
    expect(links[1]).toHaveTextContent("1 laptop");
  });

  it("links each brand tile to the catalog pre-filtered by that brand", () => {
    const products: Product[] = [{ ...base, id: "1", brand: "Dell" }];
    render(<ShopByBrand products={products} />);

    expect(screen.getByRole("link", { name: /Dell/ })).toHaveAttribute("href", "/brands/dell");
  });
});
