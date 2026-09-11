import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BestLaptops } from "./BestLaptops";
import { WishlistProvider } from "./WishlistProvider";
import { CartProvider } from "./CartProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
}));

const base = SAMPLE_PRODUCTS[0];

function renderLaptops(products: Product[]) {
  return render(
    <CartProvider>
      <WishlistProvider>
        <BestLaptops products={products} />
      </WishlistProvider>
    </CartProvider>
  );
}

describe("BestLaptops", () => {
  it("renders nothing when no product is Excellent condition and in stock", () => {
    const products: Product[] = [
      { ...base, id: "1", condition: "Good", inStock: true },
      { ...base, id: "2", condition: "Excellent", inStock: false },
    ];
    const { container } = renderLaptops(products);
    expect(container).toBeEmptyDOMElement();
  });

  it("only includes Excellent-condition, in-stock products", () => {
    const products: Product[] = [
      { ...base, id: "1", name: "Keep me", condition: "Excellent", inStock: true },
      { ...base, id: "2", name: "Wrong condition", condition: "Good", inStock: true },
      { ...base, id: "3", name: "Sold out", condition: "Excellent", inStock: false },
    ];
    renderLaptops(products);

    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.queryByText("Wrong condition")).not.toBeInTheDocument();
    expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
  });

  it("caps the list at 8 products — a curated row, not the whole catalog", () => {
    const products: Product[] = Array.from({ length: 75 }, (_, i) => ({
      ...base,
      id: `p${i}`,
      slug: `p${i}`,
      name: `Product ${i}`,
      condition: "Excellent",
      inStock: true,
    }));
    renderLaptops(products);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
  });

  it("links the Show All toggle to /shop", () => {
    const products: Product[] = [{ ...base, id: "1", condition: "Excellent", inStock: true }];
    renderLaptops(products);

    expect(screen.getByRole("link", { name: "Show all" })).toHaveAttribute("href", "/shop");
  });

  it("filters best sellers by brand using the pills, defaulting to All", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const products: Product[] = [
      { ...base, id: "1", name: "Dell One", brand: "Dell", condition: "Excellent", inStock: true },
      { ...base, id: "2", name: "HP One", brand: "HP", condition: "Excellent", inStock: true },
    ];
    renderLaptops(products);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.getByText("HP One")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dell" }));

    expect(screen.getByRole("button", { name: "Dell" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.queryByText("HP One")).not.toBeInTheDocument();
  });

  it("shows an honest empty message when a brand filter matches nothing", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const products: Product[] = [
      { ...base, id: "1", name: "Dell One", brand: "Dell", condition: "Excellent", inStock: true },
    ];
    renderLaptops(products);

    await user.click(screen.getByRole("button", { name: "Lenovo" }));

    expect(screen.queryByText("Dell One")).not.toBeInTheDocument();
    expect(screen.getByText(/No Lenovo units currently match/)).toBeInTheDocument();
  });
});
