import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSidebar } from "./FilterSidebar";
import type { ProductFilters } from "@/lib/types";

const EMPTY_FILTERS: ProductFilters = { compatibility: [], priceMin: null, priceMax: null };

describe("FilterSidebar", () => {
  it("calls onChange with the added compatibility option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} />);

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
      />
    );

    await user.click(screen.getByLabelText("macOS"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, compatibility: [] });
  });

  it("selects a price range on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={onChange} />);

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
      />
    );

    await user.click(screen.getByText("Under $1,000"));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, priceMin: null, priceMax: null });
  });

  it("starts collapsed in compact mode and expands on click", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar filters={EMPTY_FILTERS} onChange={vi.fn()} compact />);

    expect(screen.queryByText("Compatibility")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filters" }));

    expect(screen.getByText("Compatibility")).toBeInTheDocument();
  });
});
