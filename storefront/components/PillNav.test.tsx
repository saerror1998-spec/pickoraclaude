import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PillNav } from "./PillNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/shop",
}));

const ITEMS = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
];

describe("PillNav", () => {
  it("renders a link for every item", () => {
    render(<PillNav items={ITEMS} />);

    expect(screen.getByRole("menuitem", { name: "Shop" })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("menuitem", { name: "Support" })).toHaveAttribute("href", "/support");
  });

  it("marks only the item matching the current path as active", () => {
    render(<PillNav items={ITEMS} />);

    expect(screen.getAllByTestId("pill-nav-active-dot")).toHaveLength(1);
    expect(
      screen.getByRole("menuitem", { name: "Shop" }).querySelector('[data-testid="pill-nav-active-dot"]')
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Support" }).querySelector('[data-testid="pill-nav-active-dot"]')
    ).not.toBeInTheDocument();
  });
});
