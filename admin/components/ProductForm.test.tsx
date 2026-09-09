import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductForm } from "./ProductForm";
import type { AdminProductDetail } from "@/lib/types";
import type { ProductFormState } from "@/lib/actions/products";

const product: AdminProductDetail = {
  id: "p1",
  slug: "thinkpad-x1",
  name: "ThinkPad X1 Carbon",
  brand: "Lenovo",
  image: "https://example.com/x1.jpg",
  processor: "Intel i7-1165G7",
  ramGb: 16,
  storageGb: 512,
  priceCents: 89900,
  originalPriceCents: 129900,
  compatibility: ["Windows"],
  condition: "Excellent",
  inStock: true,
  sku: "SKU-1",
  specText: null,
};

describe("ProductForm", () => {
  it("renders empty required fields in create mode", () => {
    const action = vi.fn(async (): Promise<ProductFormState> => ({ error: null }));
    render(<ProductForm action={action} submitLabel="Create product" />);

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Create product" })).toBeInTheDocument();
  });

  it("pre-fills every field from the initial product in edit mode", () => {
    const action = vi.fn(async (): Promise<ProductFormState> => ({ error: null }));
    render(<ProductForm action={action} initial={product} submitLabel="Save changes" />);

    expect(screen.getByLabelText("Name")).toHaveValue("ThinkPad X1 Carbon");
    expect(screen.getByLabelText("Brand")).toHaveValue("Lenovo");
    expect(screen.getByLabelText("Price")).toHaveValue(899);
    expect(screen.getByLabelText(/Original price/)).toHaveValue(1299);
    expect(screen.getByLabelText("Windows")).toBeChecked();
    expect(screen.getByLabelText("In stock")).toBeChecked();
  });

  it("shows the returned error message after a failed submit", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<ProductFormState> => ({ error: "Something went wrong." }));
    render(<ProductForm action={action} initial={product} submitLabel="Save changes" />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong."));
  });
});
