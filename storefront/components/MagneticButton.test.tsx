import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MagneticButton } from "./MagneticButton";

describe("MagneticButton", () => {
  it("renders as a button by default", () => {
    render(<MagneticButton>Click me</MagneticButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MagneticButton onClick={onClick}>Click me</MagneticButton>);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalled();
  });

  it("renders as a real anchor with the given href when as='a'", () => {
    render(
      <MagneticButton as="a" href="/shop">
        Shop
      </MagneticButton>
    );
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/shop");
  });
});
