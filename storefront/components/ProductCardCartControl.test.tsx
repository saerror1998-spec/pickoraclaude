import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCardCartControl } from "./ProductCardCartControl";
import { CartProvider } from "./CartProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/shop",
}));

const signInWithGoogleMock = vi.fn();
let mockUser: { id: string } | null = null;

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ user: mockUser, loading: false, signInWithGoogle: signInWithGoogleMock, signOut: vi.fn() }),
}));

const product = SAMPLE_PRODUCTS[0];

function renderControl() {
  return render(
    <CartProvider>
      <ProductCardCartControl product={product} />
    </CartProvider>
  );
}

describe("ProductCardCartControl", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    mockUser = null;
  });

  it("shows a sign-in prompt instead of Add to Cart when signed out", () => {
    renderControl();
    expect(screen.getByRole("button", { name: "Sign in to add" })).toBeInTheDocument();
  });

  it("triggers Google sign-in instead of adding to cart when signed out", async () => {
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("button", { name: "Sign in to add" }));
    expect(signInWithGoogleMock).toHaveBeenCalledWith("/shop");
  });

  it("adds to cart and morphs into a live quantity stepper once signed in", async () => {
    mockUser = { id: "u1" };
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Increase quantity of ${product.name}` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Decrease quantity of ${product.name}` })).toBeInTheDocument();
  });

  it("increments and decrements the real cart quantity via the stepper", async () => {
    mockUser = { id: "u1" };
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));
    await user.click(screen.getByRole("button", { name: `Increase quantity of ${product.name}` }));
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: `Decrease quantity of ${product.name}` }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("removes the item and reverts to the Add to Cart button when quantity reaches 0", async () => {
    mockUser = { id: "u1" };
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));
    await user.click(screen.getByRole("button", { name: `Decrease quantity of ${product.name}` }));

    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeInTheDocument();
  });

  it("renders nothing for an out-of-stock product", () => {
    const { container } = render(
      <CartProvider>
        <ProductCardCartControl product={{ ...product, inStock: false }} />
      </CartProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
