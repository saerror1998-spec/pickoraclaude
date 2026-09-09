import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "./Testimonials";

describe("Testimonials", () => {
  it("renders all six real customer reviews with name, location, and date", () => {
    render(<Testimonials />);

    expect(screen.getByText("— Mohammed Ameen")).toBeInTheDocument();
    expect(screen.getByText("Dubai, UAE · August 2026")).toBeInTheDocument();
    expect(
      screen.getByText(/Laptop condition was really good and delivery was quick/)
    ).toBeInTheDocument();

    expect(screen.getByText("— Shamil Rahman")).toBeInTheDocument();
    expect(screen.getByText("— Nabeel Ashraf")).toBeInTheDocument();
    expect(screen.getByText("— Fathima Nisa")).toBeInTheDocument();
    expect(screen.getByText("— Arjun Nair")).toBeInTheDocument();
    expect(screen.getByText("— Riyas Kareem")).toBeInTheDocument();
  });

  it("marks every review as a 5-star rating for screen readers", () => {
    render(<Testimonials />);
    expect(screen.getAllByText("5 out of 5 stars")).toHaveLength(6);
  });
});
