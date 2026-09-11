import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "./ProductCard";
import { WishlistProvider } from "./WishlistProvider";
import { CartProvider } from "./CartProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shop",
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
}));

function renderCard(product: Product) {
  return render(
    <CartProvider>
      <WishlistProvider>
        <ProductCard product={product} />
      </WishlistProvider>
    </CartProvider>
  );
}

describe("ProductCard", () => {
  it("renders name, spec line, and current price", () => {
    const product = SAMPLE_PRODUCTS[0];
    renderCard(product);

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(product.processor))).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
  });

  it("shows a strikethrough original price and save badge when discounted", () => {
    const product = SAMPLE_PRODUCTS[0];
    renderCard(product);

    expect(screen.getByText("$1,499")).toBeInTheDocument();
    expect(screen.getByText(/Save \d+%/)).toBeInTheDocument();
  });

  it("does not render a save badge when there is no discount", () => {
    const product = { ...SAMPLE_PRODUCTS[0], originalPriceCents: null };
    renderCard(product);

    expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
  });

  it("shows a sold out badge for out-of-stock products", () => {
    const product = { ...SAMPLE_PRODUCTS[0], inStock: false };
    renderCard(product);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("links to the product detail page", () => {
    const product = SAMPLE_PRODUCTS[0];
    renderCard(product);

    expect(screen.getByRole("link")).toHaveAttribute("href", `/products/${product.slug}`);
  });

  it("toggles the wishlist button without navigating", async () => {
    const user = userEvent.setup();
    const product = SAMPLE_PRODUCTS[0];
    renderCard(product);

    const button = screen.getByRole("button", { name: `Add ${product.name} to wishlist` });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(screen.getByRole("button", { name: `Remove ${product.name} from wishlist` })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
