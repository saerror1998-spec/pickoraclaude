import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceLinkCard } from "./ResourceLinkCard";

describe("ResourceLinkCard", () => {
  it("renders the resource name, description, and a working external link", () => {
    render(
      <ResourceLinkCard
        resource={{
          name: "GitHub repository",
          description: "Source for both apps.",
          href: "https://github.com/saerror1998-spec/pickoraclaude",
        }}
      />
    );

    expect(screen.getByText("GitHub repository")).toBeInTheDocument();
    expect(screen.getByText("Source for both apps.")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "github.com/saerror1998-spec/pickoraclaude" });
    expect(link).toHaveAttribute("href", "https://github.com/saerror1998-spec/pickoraclaude");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
