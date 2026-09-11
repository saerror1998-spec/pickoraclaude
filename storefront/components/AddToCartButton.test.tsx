import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "./CartProvider";
import { AddToCartButton } from "./AddToCartButton";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/products/thinkpad-x1",
}));

const signInWithGoogleMock = vi.fn();
let mockUser: { id: string } | null = null;
let mockLoading = false;

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    signInWithGoogle: signInWithGoogleMock,
    signOut: vi.fn(),
  }),
}));

const product = {
  productId: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  image: "https://example.com/x1.jpg",
  priceCents: 89900,
};

describe("AddToCartButton", () => {
  beforeEach(() => {
    pushMock.mockClear();
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    mockUser = null;
    mockLoading = false;
  });

  describe("signed out", () => {
    it("shows sign-in copy instead of the normal cart actions", () => {
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      expect(screen.getByRole("button", { name: "Sign in to add to cart" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in to buy now" })).toBeInTheDocument();
    });

    it("clicking Add to Cart triggers Google sign-in instead of adding the item", async () => {
      const user = userEvent.setup();
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      await user.click(screen.getByRole("button", { name: "Sign in to add to cart" }));

      expect(signInWithGoogleMock).toHaveBeenCalledWith("/products/thinkpad-x1");
    });

    it("clicking Buy Now also triggers sign-in, not a cart add + navigation", async () => {
      const user = userEvent.setup();
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      await user.click(screen.getByRole("button", { name: "Sign in to buy now" }));

      expect(signInWithGoogleMock).toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });

    it("disables buttons while the initial auth check is loading", () => {
      mockLoading = true;
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Buy Now" })).toBeDisabled();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      mockUser = { id: "user-1" };
    });

    it("adds the product to the cart and shows confirmation", async () => {
      const user = userEvent.setup();
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      await user.click(screen.getByRole("button", { name: "Add to Cart" }));

      expect(await screen.findByText("Added to cart ✓")).toBeInTheDocument();
      expect(signInWithGoogleMock).not.toHaveBeenCalled();
    });

    it("adds the selected quantity, not always 1", async () => {
      const user = userEvent.setup();
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      await user.click(screen.getByRole("button", { name: "Increase quantity" }));
      await user.click(screen.getByRole("button", { name: "Increase quantity" }));
      expect(screen.getByText("3")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Add to Cart" }));

      expect(await screen.findByText("Added to cart ✓")).toBeInTheDocument();
    });

    it("the quantity stepper can't go below 1 or above 5", async () => {
      const user = userEvent.setup();
      render(
        <CartProvider>
          <AddToCartButton product={product} />
        </CartProvider>
      );

      expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();

      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole("button", { name: "Increase quantity" }));
      }
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
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
});
