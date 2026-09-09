import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BestOffers } from "./BestOffers";
import { WishlistProvider } from "./WishlistProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];

function renderOffers(products: Product[]) {
  return render(
    <WishlistProvider>
      <BestOffers products={products} />
    </WishlistProvider>
  );
}

describe("BestOffers", () => {
  it("renders nothing when no product has a real discount", () => {
    const products: Product[] = [{ ...base, id: "1", originalPriceCents: null }];
    const { container } = renderOffers(products);
    expect(container).toBeEmptyDOMElement();
  });

  it("orders discounted products by biggest savings first", () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Small discount", priceCents: 9000, originalPriceCents: 10000 }, // 10%
      { ...base, id: "2", name: "Big discount", priceCents: 5000, originalPriceCents: 10000 }, // 50%
      { ...base, id: "3", name: "No discount", originalPriceCents: null },
    ];
    renderOffers(products);

    const names = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(names).toEqual(["Big discount", "Small discount"]);
  });

  it("caps the list at 10 offers", () => {
    const products: Product[] = Array.from({ length: 15 }, (_, i) => ({
      ...base,
      id: `p${i}`,
      slug: `p${i}`,
      name: `Product ${i}`,
      priceCents: 5000,
      originalPriceCents: 10000,
    }));
    renderOffers(products);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });
});
