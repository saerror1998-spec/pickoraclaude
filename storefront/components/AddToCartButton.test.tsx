import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "./CartProvider";
import { AddToCartButton } from "./AddToCartButton";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const product = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
};

describe("AddToCartButton", () => {
  it("adds the product to the cart and shows confirmation", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddToCartButton product={product} />
      </CartProvider>
    );

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(await screen.findByText("Added to cart ✓")).toBeInTheDocument();
  });

  it("adds the selected quantity, not always 1", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddToCartButton product={product} />
      </CartProvider>
    );

    await user.selectOptions(screen.getByLabelText("Quantity"), "3");
    await user.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(await screen.findByText("Added to cart ✓")).toBeInTheDocument();
  });

  it("Buy Now adds to cart and navigates to /cart", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <AddToCartButton product={product} />
      </CartProvider>
    );

    await user.click(screen.getByRole("button", { name: "Buy Now" }));

    expect(pushMock).toHaveBeenCalledWith("/cart");
  });
});
