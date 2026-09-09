import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatusSelect } from "./OrderStatusSelect";

const { updateOrderStatusMock } = vi.hoisted(() => ({
  updateOrderStatusMock: vi.fn(async () => ({ error: null })),
}));

vi.mock("@/lib/actions/orders", () => ({
  updateOrderStatus: updateOrderStatusMock,
  EDITABLE_ORDER_STATUSES: ["pending", "paid", "cancelled", "expired", "refunded"],
}));

describe("OrderStatusSelect", () => {
  it("renders an editable dropdown for a real payment status", () => {
    render(<OrderStatusSelect orderId="o1" status="pending" />);
    expect(screen.getByRole("combobox", { name: "Status for order o1" })).toHaveValue("pending");
  });

  it("submits the new status on change", async () => {
    const user = userEvent.setup();
    render(<OrderStatusSelect orderId="o1" status="pending" />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Status for order o1" }), "paid");

    expect(updateOrderStatusMock).toHaveBeenCalled();
  });

  it("shows a read-only badge for a status outside the editable set", () => {
    render(<OrderStatusSelect orderId="o1" status="enabled" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("enabled")).toBeInTheDocument();
  });
});
