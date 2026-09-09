import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSidebar } from "./FilterSidebar";
import type { ProductFilters } from "@/lib/types";

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
const BRANDS = ["Dell", "HP", "Lenovo"];

describe("FilterSidebar", () => {
  it("calls onChange with the added compatibility option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} brands={BRANDS} />);

    await user.click(screen.getByLabelText("macOS"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, compatibility: ["macOS"] });
  });

  it("removes a compatibility option when unchecked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterSidebar
        filters={{ ...EMPTY_FILTERS, compatibility: ["macOS"] }}
        onChange={onChange}
        brands={BRANDS}
      />
    );

    await user.click(screen.getByLabelText("macOS"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, compatibility: [] });
  });

  it("selects a price range on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} brands={BRANDS} />);

    await user.click(screen.getByText("Under $1,000"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, priceMin: null, priceMax: 100000 });
  });

  it("deselects an active price range when clicked again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterSidebar
        filters={{ ...EMPTY_FILTERS, priceMin: null, priceMax: 100000 }}
        onChange={onChange}
        brands={BRANDS}
      />
    );

    await user.click(screen.getByText("Under $1,000"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, priceMin: null, priceMax: null });
  });

  it("starts collapsed in compact mode and expands on click", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={vi.fn()} brands={BRANDS} compact />);

    expect(screen.queryByText("Compatibility")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filters" }));

    expect(screen.getByText("Compatibility")).toBeInTheDocument();
  });

  it("lists every given brand as a select option", () => {
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={vi.fn()} brands={BRANDS} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("");
    for (const brand of BRANDS) {
      expect(screen.getByRole("option", { name: brand })).toBeInTheDocument();
    }
  });

  it("calls onChange with the selected brand", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} brands={BRANDS} />);

    await user.selectOptions(screen.getByRole("combobox"), "HP");

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, brand: "HP" });
  });

  it("reflects an already-selected brand in the dropdown", () => {
    render(
      <FilterSidebar filters={{ ...EMPTY_FILTERS, brand: "Dell" }} onChange={vi.fn()} brands={BRANDS} />
    );

    expect(screen.getByRole("combobox")).toHaveValue("Dell");
  });

  it("selects a RAM range on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} brands={BRANDS} />);

    await user.click(screen.getByText("16GB"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, ramMin: 9, ramMax: 16 });
  });

  it("selects a storage range on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} brands={BRANDS} />);

    await user.click(screen.getByText("512GB"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, storageMin: 257, storageMax: 512 });
  });
});
