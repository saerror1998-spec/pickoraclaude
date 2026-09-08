import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "@/components/CartProvider";
import CartPage from "./page";

function seedCart(items: unknown[]) {
  window.localStorage.setItem("pickora-cart", JSON.stringify(items));
}

const cartItem = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
  quantity: 2,
};

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty state with no items", async () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    expect(await screen.findByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("lists items from the cart and computes the subtotal", async () => {
    seedCart([cartItem]);
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    expect(await screen.findByText("ThinkPad X1 Carbon")).toBeInTheDocument();
    // 899.00 * 2 = 1798.00 -> formatted whole-dollar
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$1,798");
  });

  it("removes an item when its remove button is clicked", async () => {
    seedCart([cartItem]);
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    await screen.findByText("ThinkPad X1 Carbon");
    await user.click(screen.getByRole("button", { name: /Remove ThinkPad X1 Carbon/ }));

    await waitFor(() => expect(screen.getByText("Your cart is empty.")).toBeInTheDocument());
  });

  it("updating quantity updates the subtotal", async () => {
    seedCart([cartItem]);
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    await screen.findByText("ThinkPad X1 Carbon");
    await user.selectOptions(screen.getByLabelText("Quantity for ThinkPad X1 Carbon"), "1");

    await waitFor(() => expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$899"));
  });
});
