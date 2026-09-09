import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogSection } from "./CatalogSection";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const base = SAMPLE_PRODUCTS[0];
const products: Product[] = [
  { ...base, id: "1", slug: "dell-1", name: "Dell One", brand: "Dell" },
  { ...base, id: "2", slug: "hp-1", name: "HP One", brand: "HP" },
];

describe("CatalogSection", () => {
  it("shows every product when no initial brand is given", () => {
    render(<CatalogSection products={products} />);
    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.getByText("HP One")).toBeInTheDocument();
  });

  it("shows a generic heading when no initial brand is given", () => {
    render(<CatalogSection products={products} />);
    expect(screen.getByRole("heading", { level: 1, name: "All laptops" })).toBeInTheDocument();
  });

  it("shows a brand-specific heading when an initial brand is given", () => {
    render(<CatalogSection products={products} initialBrand="Dell" />);
    expect(screen.getByRole("heading", { level: 1, name: "Dell laptops" })).toBeInTheDocument();
  });

  it("pre-filters to the given initialBrand and shows a removable chip", () => {
    render(<CatalogSection products={products} initialBrand="Dell" />);

    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.queryByText("HP One")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dell/ })).toBeInTheDocument();
  });

  it("clears the brand filter when the chip is clicked", async () => {
    const user = userEvent.setup();
    render(<CatalogSection products={products} initialBrand="Dell" />);

    await user.click(screen.getByRole("button", { name: /Dell/ }));

    expect(screen.getByText("HP One")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Dell/ })).not.toBeInTheDocument();
  });
});
