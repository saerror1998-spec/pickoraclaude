import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FunnelCard } from "./FunnelCard";
import type { FunnelStage } from "@/lib/types";

const stages: FunnelStage[] = [
  { stage: "Add to cart", count: 38200, percentOfPrevious: null },
  { stage: "Checkout", count: 16800, percentOfPrevious: 44 },
  { stage: "Purchase", count: 5640, percentOfPrevious: 34 },
];

describe("FunnelCard", () => {
  it("renders each stage's label and compact count", () => {
    render(<FunnelCard stages={stages} />);
    expect(screen.getByText("Add to cart")).toBeInTheDocument();
    expect(screen.getByText("38.2K")).toBeInTheDocument();
    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText("16.8K")).toBeInTheDocument();
    expect(screen.getByText("Purchase")).toBeInTheDocument();
    expect(screen.getByText("5.6K")).toBeInTheDocument();
  });

  it("does not render a percent badge for the first stage", () => {
    render(<FunnelCard stages={stages} />);
    expect(screen.queryByText("44%")).toBeInTheDocument();
    expect(screen.queryByText("34%")).toBeInTheDocument();
  });

  it("sizes later stages narrower than the first", () => {
    const { container } = render(<FunnelCard stages={stages} />);
    const bars = Array.from(container.querySelectorAll<HTMLElement>("[style*='width']"));
    const widths = bars.map((el) => parseFloat(el.style.width));
    expect(widths).toHaveLength(3);
    expect(widths[0]).toBeGreaterThan(widths[1]);
    expect(widths[1]).toBeGreaterThan(widths[2]);
  });
});
