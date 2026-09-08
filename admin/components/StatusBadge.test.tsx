import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the raw status for a known label", () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("relabels Nomod's real unpaid-session status ('enabled') as 'awaiting payment'", () => {
    render(<StatusBadge status="enabled" />);
    expect(screen.getByText("awaiting payment")).toBeInTheDocument();
    expect(screen.queryByText("enabled")).not.toBeInTheDocument();
  });

  it("falls back gracefully for an unrecognized status", () => {
    render(<StatusBadge status="some-new-status" />);
    expect(screen.getByText("some-new-status")).toBeInTheDocument();
  });
});
