import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogSection } from "./CatalogSection";
import { WishlistProvider } from "./WishlistProvider";
import { CartProvider } from "./CartProvider";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Product, ProductFilters } from "@/lib/types";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/shop",
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
}));

const EMPTY_FILTERS: ProductFilters = {
  compatibility: [],
  priceMin: null,
  priceMax: null,
  brand: null,
  ramMin: null,
  ramMax: null,
  storageMin: null,
  storageMax: null,
};

const base = SAMPLE_PRODUCTS[0];
const products: Product[] = [
  { ...base, id: "1", slug: "dell-1", name: "Dell One", brand: "Dell" },
  { ...base, id: "2", slug: "hp-1", name: "HP One", brand: "HP" },
];

function renderCatalog(overrides: Partial<Parameters<typeof CatalogSection>[0]> = {}) {
  return render(
    <CartProvider>
      <WishlistProvider>
        <CatalogSection
          products={products}
          brands={["Dell", "HP"]}
          filters={EMPTY_FILTERS}
          sort="featured"
          page={1}
          totalPages={1}
          totalCount={products.length}
          {...overrides}
        />
      </WishlistProvider>
    </CartProvider>
  );
}

describe("CatalogSection", () => {
  beforeEach(() => pushMock.mockClear());

  it("shows the given page's products", () => {
    renderCatalog();
    expect(screen.getByText("Dell One")).toBeInTheDocument();
    expect(screen.getByText("HP One")).toBeInTheDocument();
  });

  it("shows a generic heading when no brand filter is active", () => {
    renderCatalog();
    expect(screen.getByRole("heading", { level: 1, name: "All laptops" })).toBeInTheDocument();
  });

  it("shows a brand-specific heading and a removable chip when a brand filter is active", () => {
    renderCatalog({ filters: { ...EMPTY_FILTERS, brand: "Dell" }, products: [products[0]], totalCount: 1 });
    expect(screen.getByRole("heading", { level: 1, name: "Dell laptops" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear brand filter/ })).toBeInTheDocument();
  });

  it("navigates to /shop with the brand filter removed when the chip is clicked", async () => {
    const user = userEvent.setup();
    renderCatalog({ filters: { ...EMPTY_FILTERS, brand: "Dell" }, products: [products[0]], totalCount: 1 });

    await user.click(screen.getByRole("button", { name: /Clear brand filter/ }));

    expect(pushMock).toHaveBeenCalledWith("/shop");
  });

  it("navigates with the new brand when a filter is changed, resetting to page 1", async () => {
    const user = userEvent.setup();
    renderCatalog({ page: 3, totalPages: 5 });

    // FilterSidebar renders twice (desktop + mobile-compact copies); either works.
    const [brandSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(brandSelect, "Dell");

    expect(pushMock).toHaveBeenCalledWith("/shop?brand=Dell");
  });

  it("shows the real total laptop count, not just the current page's count", () => {
    renderCatalog({ products: products.slice(0, 1), totalCount: 42 });
    expect(screen.getByText("42 laptops")).toBeInTheDocument();
  });

  it("shows an honest empty state when the current page has no products", () => {
    renderCatalog({ products: [], totalCount: 0 });
    expect(screen.getByText(/No laptops match those filters/)).toBeInTheDocument();
  });

  it("renders pagination controls when there's more than one page", () => {
    renderCatalog({ page: 2, totalPages: 5 });
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("does not render pagination controls when everything fits on one page", () => {
    renderCatalog({ page: 1, totalPages: 1 });
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
  });
});
