import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistProvider, useWishlist } from "./WishlistProvider";

const product = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
};

function TestHarness() {
  const { items, itemCount, isWishlisted, toggleItem, removeItem } = useWishlist();
  return (
    <div>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="wishlisted">{isWishlisted("p1") ? "yes" : "no"}</p>
      <ul>
        {items.map((item) => <li key={item.productId}>{item.name}</li>)}
      </ul>
      <button onClick={() => toggleItem(product)}>Toggle</button>
      <button onClick={() => removeItem("p1")}>Remove</button>
    </div>
  );
}

describe("WishlistProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", async () => {
    render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });

  it("adds an item on toggle and reports it as wishlisted", async () => {
    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );

    await user.click(screen.getByText("Toggle"));

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("wishlisted")).toHaveTextContent("yes");
    expect(screen.getByText("ThinkPad X1 Carbon")).toBeInTheDocument();
  });

  it("removes the item when toggled again", async () => {
    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );

    await user.click(screen.getByText("Toggle"));
    await user.click(screen.getByText("Toggle"));

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("wishlisted")).toHaveTextContent("no");
  });

  it("removes an item via removeItem", async () => {
    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );

    await user.click(screen.getByText("Toggle"));
    await user.click(screen.getByText("Remove"));

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists to localStorage and rehydrates on next mount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );
    await user.click(screen.getByText("Toggle"));
    await waitFor(() => expect(window.localStorage.getItem("pickora-wishlist")).toContain("ThinkPad"));
    unmount();

    render(
      <WishlistProvider>
        <TestHarness />
      </WishlistProvider>
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  });
});
