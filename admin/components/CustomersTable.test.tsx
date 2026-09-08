import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomersTable } from "./CustomersTable";
import type { AdminCustomer } from "@/lib/types";

const customer: AdminCustomer = {
  email: "buyer@example.com",
  name: "Buyer One",
  orderCount: 2,
  paidOrderCount: 1,
  totalSpentCents: 96500,
  lastOrderAt: "2026-09-02T10:00:00.000Z",
};

describe("CustomersTable", () => {
  it("shows an empty state with no customers", () => {
    render(<CustomersTable customers={[]} />);
    expect(screen.getByText(/No customers yet/)).toBeInTheDocument();
  });

  it("renders customer name, order counts, and total spent", () => {
    render(<CustomersTable customers={[customer]} />);

    expect(screen.getByText("Buyer One")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(screen.getByText("$965")).toBeInTheDocument();
  });

  it("falls back to email as the display name when name is unknown", () => {
    render(<CustomersTable customers={[{ ...customer, name: null }]} />);

    const emailOccurrences = screen.getAllByText("buyer@example.com");
    expect(emailOccurrences).toHaveLength(1);
  });
});
