import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTABanner } from "./CTABanner";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

const base = SAMPLE_PRODUCTS[0];

describe("CTABanner", () => {
  it("renders nothing when there are no in-stock products", () => {
    const { container } = render(<CTABanner products={[{ ...base, inStock: false }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links Shop Laptops to /shop and WhatsApp to the real Pickora number", () => {
    render(<CTABanner products={[{ ...base, inStock: true }]} />);

    expect(screen.getByRole("link", { name: "Shop Laptops" })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /Chat on WhatsApp/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/971524078652")
    );
  });
});
