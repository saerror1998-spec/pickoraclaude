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

  it("links to pages that actually exist in this app, plus the real social profiles", () => {
    render(<Footer />);
    const hrefs = screen.getAllByRole("link").map((el) => el.getAttribute("href"));
    const allowed = [
      "/shop",
      "/warranty",
      "/support",
      "/account",
      "/cart",
      "/login",
      "/#why-pickora",
      "mailto:hello@pickoraonline.com",
      "https://www.instagram.com/pickora.online",
      "https://www.tiktok.com/@pickora.online",
    ];
    for (const href of hrefs) {
      expect(allowed).toContain(href);
    }
  });

  it("renders the Shop, Account, and Support link columns with real destinations", () => {
    render(<Footer />);

    expect(screen.getAllByText("Shop").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Account").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Support").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Your account" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Sign in" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Email hello@pickoraonline\.com/ }).length).toBeGreaterThan(0);
  });

  it("shows the accepted payment methods", () => {
    render(<Footer />);
    expect(screen.getAllByText("tabby").length).toBeGreaterThan(0);
    expect(screen.getAllByText("tamara").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Apple Pay").length).toBeGreaterThan(0);
  });

  it("links to the real Instagram and TikTok profiles, opening in a new tab", () => {
    render(<Footer />);

    const instagram = screen.getAllByRole("link", { name: "Instagram" })[0];
    expect(instagram).toHaveAttribute("href", "https://www.instagram.com/pickora.online");
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("rel", "noopener noreferrer");

    const tiktok = screen.getAllByRole("link", { name: "TikTok" })[0];
    expect(tiktok).toHaveAttribute("href", "https://www.tiktok.com/@pickora.online");
  });
});
