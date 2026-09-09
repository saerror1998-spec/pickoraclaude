import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogBreakdownCard } from "./CatalogBreakdownCard";

describe("CatalogBreakdownCard", () => {
  it("shows an empty state with no items", () => {
    render(<CatalogBreakdownCard title="Catalog by condition" items={[]} />);
    expect(screen.getByText("No products yet.")).toBeInTheDocument();
  });

  it("renders each item's label and count", () => {
    render(
      <CatalogBreakdownCard
        title="Catalog by condition"
        items={[
          { label: "Excellent", count: 10 },
          { label: "Good", count: 4 },
        ]}
      />
    );

    expect(screen.getByText("Catalog by condition")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("sizes bars proportionally to the largest count", () => {
    const { container } = render(
      <CatalogBreakdownCard
        title="t"
        items={[
          { label: "A", count: 10 },
          { label: "B", count: 5 },
        ]}
      />
    );
    const bars = Array.from(container.querySelectorAll<HTMLElement>("[style*='width']"));
    const widths = bars.map((el) => parseFloat(el.style.width));
    expect(widths[0]).toBeGreaterThan(widths[1]);
  });
});
