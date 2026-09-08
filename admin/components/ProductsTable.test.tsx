import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsTable } from "./ProductsTable";
import type { AdminProduct } from "@/lib/types";

const products: AdminProduct[] = [
  { id: "1", name: "ThinkPad X1 Carbon Gen 9", brand: "Lenovo", priceCents: 89900, inStock: true, condition: "Excellent" },
  { id: "2", name: "ThinkPad T14 Gen 2", brand: "Lenovo", priceCents: 104900, inStock: false, condition: "Excellent" },
];

describe("ProductsTable", () => {
  it("renders a row per product with formatted price", () => {
    render(<ProductsTable products={products} />);
    expect(screen.getByText("ThinkPad X1 Carbon Gen 9")).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
  });

  it("shows in-stock and sold-out status correctly", () => {
    render(<ProductsTable products={products} />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("shows an empty state when there are no products", () => {
    render(<ProductsTable products={[]} />);
    expect(screen.getByText(/No products yet/)).toBeInTheDocument();
  });
});
