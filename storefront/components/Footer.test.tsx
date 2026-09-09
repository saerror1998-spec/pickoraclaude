import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the real navigation links, not the app-download buttons from the original template", () => {
    render(<Footer />);

    expect(screen.getAllByRole("link", { name: /Shop laptops|^Shop$/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Warranty/ }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Download iOS/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Download Android/)).not.toBeInTheDocument();
  });

  it("does not reference the original template's own branding", () => {
    render(<Footer />);
    expect(screen.queryByText(/Volvox/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SOBERS/)).not.toBeInTheDocument();
  });

  it("shows the current year in the copyright line", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getAllByText(new RegExp(year)).length).toBeGreaterThan(0);
  });

  it("links to pages that actually exist in this app", () => {
    render(<Footer />);
    const hrefs = screen.getAllByRole("link").map((el) => el.getAttribute("href"));
    for (const href of hrefs) {
      expect(["/shop", "/warranty", "/support", "/account"]).toContain(href);
    }
  });
});
