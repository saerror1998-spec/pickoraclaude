import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromoBand } from "./PromoBand";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

const base = SAMPLE_PRODUCTS[0];

describe("PromoBand", () => {
  it("renders nothing when there are no products", () => {
    const { container } = render(<PromoBand products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows only real, already-verified offers — never the unverified 'first order' discount", () => {
    render(<PromoBand products={[base]} />);

    expect(screen.getByText("Free shipping on every order")).toBeInTheDocument();
    expect(screen.getByText("0% APR with tabby & tamara")).toBeInTheDocument();
    expect(screen.getByText(/price match/i)).toBeInTheDocument();
    expect(screen.queryByText(/first order/i)).not.toBeInTheDocument();
  });
});
