import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./ResetPasswordForm";

const sendPasswordResetMock = vi.fn();
const setPasswordMock = vi.fn();
const pushMock = vi.fn();

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ sendPasswordReset: sendPasswordResetMock, setPassword: setPasswordMock }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    sendPasswordResetMock.mockReset();
    sendPasswordResetMock.mockResolvedValue(undefined);
    setPasswordMock.mockReset();
    setPasswordMock.mockResolvedValue(undefined);
    pushMock.mockReset();
    window.location.hash = "";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("in request mode, sends a reset email", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    expect(screen.getByRole("heading", { name: /Reset your password/ })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.click(screen.getByRole("button", { name: /Send reset link/ }));

    expect(sendPasswordResetMock).toHaveBeenCalledWith("buyer@example.com");
    expect(await screen.findByText(/Check your email/)).toBeInTheDocument();
  });

  it("in confirm mode (recovery link hash present), sets a new password", async () => {
    window.location.hash = "#access_token=abc&type=recovery";
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    expect(await screen.findByRole("heading", { name: /Set a new password/ })).toBeInTheDocument();

    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password1");
    await user.click(screen.getByRole("button", { name: /Update password/ }));

    expect(setPasswordMock).toHaveBeenCalledWith("new-password1");
    expect(await screen.findByText(/Password updated/)).toBeInTheDocument();
  });
});
