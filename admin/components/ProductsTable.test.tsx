import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductsTable } from "./ProductsTable";
import type { AdminProduct } from "@/lib/types";

const products: AdminProduct[] = [
  {
    id: "1",
    slug: "thinkpad-x1-carbon-gen-9",
    name: "ThinkPad X1 Carbon Gen 9",
    brand: "Lenovo",
    image: "https://example.com/x1.jpg",
    priceCents: 89900,
    inStock: true,
    condition: "Excellent",
  },
  {
    id: "2",
    slug: "thinkpad-t14-gen-2",
    name: "ThinkPad T14 Gen 2",
    brand: "Lenovo",
    image: "https://example.com/t14.jpg",
    priceCents: 104900,
    inStock: false,
    condition: "Excellent",
  },
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

  it("links each row to its edit page", () => {
    render(<ProductsTable products={products} />);
    const editLinks = screen.getAllByRole("link", { name: "Edit" });
    expect(editLinks[0]).toHaveAttribute("href", "/products/1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/products/2/edit");
  });

  it("shows an empty state when there are no products", () => {
    render(<ProductsTable products={[]} />);
    expect(screen.getByText(/No products yet/)).toBeInTheDocument();
  });
});
