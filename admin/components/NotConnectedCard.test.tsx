import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotConnectedCard } from "./NotConnectedCard";

describe("NotConnectedCard", () => {
  it("renders the given title and description", () => {
    render(<NotConnectedCard title="Not connected yet" description="No provider is wired up." />);

    expect(screen.getByText("Not connected yet")).toBeInTheDocument();
    expect(screen.getByText("No provider is wired up.")).toBeInTheDocument();
  });
});
