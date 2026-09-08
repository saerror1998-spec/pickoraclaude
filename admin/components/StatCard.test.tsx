import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";
import type { StatSummary } from "@/lib/types";

const stat: StatSummary = {
  label: "Orders",
  value: "1,842",
  deltaLabel: "+4.1% vs prior 30 days",
  trend: "up",
};

describe("StatCard", () => {
  it("renders label, value, and delta", () => {
    render(<StatCard stat={stat} />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("1,842")).toBeInTheDocument();
    expect(screen.getByText(/4\.1%/)).toBeInTheDocument();
  });

  it("uses the negative color class for a down trend", () => {
    render(<StatCard stat={{ ...stat, trend: "down", deltaLabel: "-2% vs prior 30 days" }} />);
    expect(screen.getByText(/-2%/)).toHaveClass("text-negative");
  });

  it("uses the positive color class for an up trend", () => {
    render(<StatCard stat={stat} />);
    expect(screen.getByText(/4\.1%/)).toHaveClass("text-positive");
  });
});
