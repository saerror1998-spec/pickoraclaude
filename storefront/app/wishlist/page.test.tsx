import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistProvider } from "@/components/WishlistProvider";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";
import WishlistPage from "./page";

function seedWishlist(items: unknown[]) {
  window.localStorage.setItem("pickora-wishlist", JSON.stringify(items));
}

const wishlistItem = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
};

function renderPage() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <WishlistPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("WishlistPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty state with no items", async () => {
    renderPage();
    expect(await screen.findByText("Your wishlist is empty.")).toBeInTheDocument();
  });

  it("lists items from the wishlist", async () => {
    seedWishlist([wishlistItem]);
    renderPage();

    expect(await screen.findByText("ThinkPad X1 Carbon")).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
  });

  it("removes an item when its remove button is clicked", async () => {
    seedWishlist([wishlistItem]);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("ThinkPad X1 Carbon");
    await user.click(screen.getByRole("button", { name: /Remove ThinkPad X1 Carbon/ }));

    await waitFor(() => expect(screen.getByText("Your wishlist is empty.")).toBeInTheDocument());
  });
});
