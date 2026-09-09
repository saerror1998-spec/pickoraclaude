import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhyPickora } from "./WhyPickora";

describe("WhyPickora", () => {
  it("renders the section with the #why-pickora anchor id", () => {
    const { container } = render(<WhyPickora />);
    expect(container.querySelector("#why-pickora")).toBeInTheDocument();
  });

  it("renders all four reason cards", () => {
    render(<WhyPickora />);
    expect(screen.getByText("90-day warranty")).toBeInTheDocument();
    expect(screen.getByText("Free shipping")).toBeInTheDocument();
    expect(screen.getByText("Price match")).toBeInTheDocument();
    expect(screen.getByText("0% APR financing")).toBeInTheDocument();
  });

  it("renders the four-step certification process in order", () => {
    render(<WhyPickora />);
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent("Diagnose");
    expect(steps[1]).toHaveTextContent("Repair & replace");
    expect(steps[2]).toHaveTextContent("Deep clean");
    expect(steps[3]).toHaveTextContent("Grade & certify");
  });

  it("renders the refurbished-vs-new comparison rows", () => {
    render(<WhyPickora />);
    expect(screen.getByText("Refurbished vs. brand new")).toBeInTheDocument();
    expect(screen.getByText("Price vs. retail")).toBeInTheDocument();
    expect(screen.getByText("Up to 40% less")).toBeInTheDocument();
  });
});
