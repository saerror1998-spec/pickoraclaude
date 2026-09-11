import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductSpecPills } from "./ProductSpecPills";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

describe("ProductSpecPills", () => {
  it("shows the product's real processor, RAM, storage, and compatibility — no fabricated variant options", () => {
    const product = SAMPLE_PRODUCTS[0];
    render(<ProductSpecPills product={product} />);

    expect(screen.getByText(product.processor)).toBeInTheDocument();
    expect(screen.getByText(`${product.ramGb}GB RAM`)).toBeInTheDocument();
    expect(screen.getByText(`${product.storageGb}GB storage`)).toBeInTheDocument();
    for (const os of product.compatibility) {
      expect(screen.getByText(os)).toBeInTheDocument();
    }
  });
});
