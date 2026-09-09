import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductInfoAccordion } from "./ProductInfoAccordion";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

describe("ProductInfoAccordion", () => {
  it("shows the shipping & returns section expanded by default", () => {
    render(<ProductInfoAccordion product={SAMPLE_PRODUCTS[0]} />);

    expect(screen.getByText("Shipping & returns")).toBeInTheDocument();
    expect(screen.getByText(/Free shipping on every order/)).toBeInTheDocument();
  });

  it("lists every FAQ question", () => {
    render(<ProductInfoAccordion product={SAMPLE_PRODUCTS[0]} />);

    expect(screen.getByText("How long does delivery take?")).toBeInTheDocument();
    expect(screen.getByText("What warranty comes with this laptop?")).toBeInTheDocument();
    expect(screen.getByText("Is this laptop tested before shipping?")).toBeInTheDocument();
    expect(screen.getByText("Will I receive the exact unit shown in the photo?")).toBeInTheDocument();
    expect(screen.getByText("What if something's wrong with my order?")).toBeInTheDocument();
    expect(screen.getByText("Is payment secure?")).toBeInTheDocument();
  });

  it("mentions the product's real condition grade in the unit-photo answer", async () => {
    const user = userEvent.setup();
    const product = { ...SAMPLE_PRODUCTS[0], condition: "Good" as const };
    render(<ProductInfoAccordion product={product} />);

    await user.click(screen.getByText("Will I receive the exact unit shown in the photo?"));

    expect(screen.getByText(/condition grade \(Good\)/)).toBeInTheDocument();
  });

  it("expands an FAQ item to reveal its answer", async () => {
    const user = userEvent.setup();
    render(<ProductInfoAccordion product={SAMPLE_PRODUCTS[0]} />);

    await user.click(screen.getByText("Is payment secure?"));

    expect(screen.getByText(/Checkout runs through Nomod/)).toBeInTheDocument();
  });
});
