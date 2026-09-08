import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar", () => {
  it("renders the mobile menu button collapsed by default", () => {
    render(<Sidebar />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the mobile nav drawer when the menu button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    // Nav items should now appear (desktop nav is duplicated but at least one link per label is present)
    expect(screen.getAllByRole("link", { name: "Products" }).length).toBeGreaterThan(0);
  });

  it("marks the current page's nav link as active", () => {
    render(<Sidebar />);
    const overviewLinks = screen.getAllByRole("link", { name: "Overview" });
    expect(overviewLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });
});
