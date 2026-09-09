import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsAppButton } from "./WhatsAppButton";

describe("WhatsAppButton", () => {
  it("links to the real Pickora WhatsApp number, opening in a new tab", () => {
    render(<WhatsAppButton />);

    const link = screen.getByRole("link", { name: "Chat with Pickora on WhatsApp" });
    expect(link).toHaveAttribute("href", expect.stringContaining("https://wa.me/971524078652"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
