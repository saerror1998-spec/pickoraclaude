import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalesTrendChart } from "./SalesTrendChart";

describe("SalesTrendChart", () => {
  it("shows an empty state with no revenue data", () => {
    render(<SalesTrendChart data={[]} />);
    expect(screen.getByText(/No paid orders yet/)).toBeInTheDocument();
  });
});
