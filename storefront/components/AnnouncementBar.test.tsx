import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnouncementBar } from "./AnnouncementBar";

describe("AnnouncementBar", () => {
  it("shows the announcement message", () => {
    render(<AnnouncementBar />);
    expect(
      screen.getByText("Premium Tech. Smarter Prices. — Shop Refurbished Laptops at Pickora")
    ).toBeInTheDocument();
  });

  it("links to the catalog", () => {
    render(<AnnouncementBar />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/shop");
  });
});
