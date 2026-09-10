import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomepageBuyersGuide } from "./HomepageBuyersGuide";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

describe("HomepageBuyersGuide", () => {
  it("mentions refurbished laptops in Dubai & the UAE in the intro copy", () => {
    render(<HomepageBuyersGuide products={SAMPLE_PRODUCTS} />);
    expect(screen.getByText(/certified refurbished laptops in Dubai and across the UAE/)).toBeInTheDocument();
  });

  it("shows a real per-brand starting price computed from in-stock products only", () => {
    const products: Product[] = [
      { ...SAMPLE_PRODUCTS[0], id: "1", brand: "Dell", priceCents: 90000, inStock: true },
      { ...SAMPLE_PRODUCTS[0], id: "2", brand: "Dell", priceCents: 50000, inStock: true },
      { ...SAMPLE_PRODUCTS[0], id: "3", brand: "Dell", priceCents: 10000, inStock: false }, // cheaper but out of stock
    ];
    render(<HomepageBuyersGuide products={products} />);

    // Cheapest IN-STOCK Dell is $500, not the $100 out-of-stock one.
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.queryByText("$100")).not.toBeInTheDocument();
  });

  it("links each brand row to its filtered shop page", () => {
    const products: Product[] = [{ ...SAMPLE_PRODUCTS[0], id: "1", brand: "Dell", inStock: true }];
    render(<HomepageBuyersGuide products={products} />);

    expect(screen.getByRole("link", { name: /\$/ })).toHaveAttribute("href", "/shop?brand=Dell");
  });

  it("renders all three real buyer's-guide FAQ questions", () => {
    render(<HomepageBuyersGuide products={SAMPLE_PRODUCTS} />);

    expect(screen.getByText("Is a 90-day warranty enough?")).toBeInTheDocument();
    expect(screen.getByText('What does "Certified Refurbished" mean at Pickora?')).toBeInTheDocument();
    expect(screen.getByText("Can I pay in installments?")).toBeInTheDocument();
  });

  it("includes real FAQPage structured data matching the on-page questions", () => {
    const { container } = render(<HomepageBuyersGuide products={SAMPLE_PRODUCTS} />);

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toBeInTheDocument();
    const data = JSON.parse(jsonLd!.innerHTML);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(3);
  });

  it("doesn't render a price table when there are no in-stock products", () => {
    const products: Product[] = [{ ...SAMPLE_PRODUCTS[0], id: "1", inStock: false }];
    render(<HomepageBuyersGuide products={products} />);

    expect(screen.queryByText("How much do refurbished laptops cost in the UAE?")).not.toBeInTheDocument();
  });
});
