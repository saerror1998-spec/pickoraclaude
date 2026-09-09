import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { AnnouncementBar } from "./AnnouncementBar";

describe("AnnouncementBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the first message on mount", () => {
    render(<AnnouncementBar />);
    expect(screen.getByText("Premium Refurbished Laptops • Dell, HP & Lenovo • Shop Pickora UAE")).toBeInTheDocument();
  });

  it("rotates to the next message after the interval elapses", () => {
    render(<AnnouncementBar />);

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(
      screen.getByText("Quality Refurbished Laptops at Better Prices — Shop Dell, HP & Lenovo")
    ).toBeInTheDocument();
  });

  it("wraps back to the first message after the last one", () => {
    render(<AnnouncementBar />);

    act(() => {
      vi.advanceTimersByTime(4500 * 3);
    });

    expect(screen.getByText("Premium Refurbished Laptops • Dell, HP & Lenovo • Shop Pickora UAE")).toBeInTheDocument();
  });
});
