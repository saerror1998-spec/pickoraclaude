import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityTimeline } from "./ActivityTimeline";
import type { ActivityEvent } from "@/lib/types";

describe("ActivityTimeline", () => {
  it("shows an empty state with no events", () => {
    render(<ActivityTimeline events={[]} />);
    expect(screen.getByText(/No activity yet/)).toBeInTheDocument();
  });

  it("renders each event's message and detail", () => {
    const events: ActivityEvent[] = [
      {
        id: "o1-placed",
        type: "order_placed",
        message: "Order pickora-1 placed",
        detail: "buyer@example.com",
        timestamp: "2026-09-01T10:00:00.000Z",
      },
      {
        id: "product-p1",
        type: "product_listed",
        message: "Lenovo ThinkPad X1 listed",
        detail: null,
        timestamp: "2026-09-05T00:00:00.000Z",
      },
    ];
    render(<ActivityTimeline events={events} />);

    expect(screen.getByText("Order pickora-1 placed")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lenovo ThinkPad X1 listed")).toBeInTheDocument();
  });
});
