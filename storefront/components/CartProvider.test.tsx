import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "./CartProvider";

const product = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
};

function TestHarness() {
  const { items, itemCount, subtotalCents, addItem, removeItem, setQuantity } = useCart();
  return (
    <div>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="subtotal">{subtotalCents}</p>
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.name} x{item.quantity}
          </li>
        ))}
      </ul>
      <button onClick={() => addItem(product)}>Add one</button>
      <button onClick={() => addItem(product, 2)}>Add two</button>
      <button onClick={() => removeItem("p1")}>Remove</button>
      <button onClick={() => setQuantity("p1", 5)}>Set to 5</button>
      <button onClick={() => setQuantity("p1", 0)}>Set to 0</button>
    </div>
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", async () => {
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });

  it("adds an item and computes count/subtotal", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("Add one"));

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("89900");
    expect(screen.getByText("ThinkPad X1 Carbon x1")).toBeInTheDocument();
  });

  it("merges quantities when adding the same product twice", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("Add one"));
    await user.click(screen.getByText("Add two"));

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    expect(screen.getByText("ThinkPad X1 Carbon x3")).toBeInTheDocument();
  });

  it("removes an item", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("Add one"));
    await user.click(screen.getByText("Remove"));

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("setQuantity to 0 removes the item", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("Add one"));
    await user.click(screen.getByText("Set to 0"));

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists to localStorage and rehydrates on next mount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );
    await user.click(screen.getByText("Add one"));
    await waitFor(() => expect(window.localStorage.getItem("pickora-cart")).toContain("ThinkPad"));
    unmount();

    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  });
});
