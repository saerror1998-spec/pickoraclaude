import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogTable } from "./LogTable";
import type { ActivityEvent } from "@/lib/types";

describe("LogTable", () => {
  it("shows an empty state with no events", () => {
    render(<LogTable events={[]} />);
    expect(screen.getByText(/No log entries yet/)).toBeInTheDocument();
  });

  it("renders the event type label and message", () => {
    const events: ActivityEvent[] = [
      {
        id: "o1-status",
        type: "order_status_changed",
        message: 'Order pickora-1 status changed to "paid"',
        detail: "buyer@example.com",
        timestamp: "2026-09-01T10:05:00.000Z",
      },
    ];
    render(<LogTable events={events} />);

    expect(screen.getByText("STATUS")).toBeInTheDocument();
    expect(screen.getByText(/Order pickora-1 status changed to "paid"/)).toBeInTheDocument();
  });
});
