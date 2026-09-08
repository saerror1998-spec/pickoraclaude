import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutStatusCard } from "./CheckoutStatusCard";

describe("CheckoutStatusCard", () => {
  it("renders title, message, and primary action link", () => {
    render(
      <CheckoutStatusCard
        icon={<span>✓</span>}
        title="Payment successful"
        message="Thanks for your order."
        primaryAction={{ href: "/", label: "Continue shopping" }}
      />
    );

    expect(screen.getByRole("heading", { name: "Payment successful" })).toBeInTheDocument();
    expect(screen.getByText("Thanks for your order.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/");
  });

  it("shows the order reference when provided", () => {
    render(
      <CheckoutStatusCard
        icon={<span>✓</span>}
        title="Payment successful"
        message="Thanks."
        referenceId="pickora-123"
        primaryAction={{ href: "/", label: "Continue shopping" }}
      />
    );

    expect(screen.getByText(/pickora-123/)).toBeInTheDocument();
  });

  it("omits the reference line when not provided", () => {
    render(
      <CheckoutStatusCard
        icon={<span>✓</span>}
        title="Payment successful"
        message="Thanks."
        primaryAction={{ href: "/", label: "Continue shopping" }}
      />
    );

    expect(screen.queryByText(/Order reference/)).not.toBeInTheDocument();
  });
});
