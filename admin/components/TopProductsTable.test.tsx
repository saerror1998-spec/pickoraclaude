import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopProductsTable } from "./TopProductsTable";
import type { TopProduct } from "@/lib/types";

describe("TopProductsTable", () => {
  it("shows an empty state with no products", () => {
    render(<TopProductsTable products={[]} />);
    expect(screen.getByText(/No paid orders yet/)).toBeInTheDocument();
  });

  it("renders product name, units sold, and revenue", () => {
    const products: TopProduct[] = [
      { productId: "p1", name: "ThinkPad X1", unitsSold: 3, revenueCents: 289500 },
    ];
    render(<TopProductsTable products={products} />);

    expect(screen.getByText("ThinkPad X1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("$2,895")).toBeInTheDocument();
  });
});
