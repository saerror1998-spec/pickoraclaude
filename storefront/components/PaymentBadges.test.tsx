import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentBadges } from "./PaymentBadges";

describe("PaymentBadges", () => {
  it("lists the real, Nomod-confirmed payment methods", () => {
    render(<PaymentBadges />);

    for (const method of ["Visa", "Mastercard", "Apple Pay", "tabby", "tamara"]) {
      expect(screen.getByText(method)).toBeInTheDocument();
    }
  });
});
