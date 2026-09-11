import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailSignupForm } from "./EmailSignupForm";

const sendEmailOtpMock = vi.fn();
const verifyEmailOtpMock = vi.fn();
const setPasswordMock = vi.fn();
const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    sendEmailOtp: sendEmailOtpMock,
    verifyEmailOtp: verifyEmailOtpMock,
    setPassword: setPasswordMock,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

describe("EmailSignupForm", () => {
  beforeEach(() => {
    sendEmailOtpMock.mockReset();
    sendEmailOtpMock.mockResolvedValue(undefined);
    verifyEmailOtpMock.mockReset();
    verifyEmailOtpMock.mockResolvedValue(undefined);
    setPasswordMock.mockReset();
    setPasswordMock.mockResolvedValue(undefined);
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("walks through email -> OTP -> create password", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm redirectPath="/account" />);

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.click(screen.getByRole("button", { name: /Send verification code/ }));

    expect(sendEmailOtpMock).toHaveBeenCalledWith("buyer@example.com");
    expect(await screen.findByText(/We sent a 6-digit code/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: /Verify code/ }));

    expect(verifyEmailOtpMock).toHaveBeenCalledWith("buyer@example.com", "123456");
    expect(await screen.findByText(/Email verified/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Password"), "hunter22");
    await user.type(screen.getByLabelText("Confirm password"), "hunter22");
    await user.click(screen.getByRole("button", { name: /Create account/ }));

    expect(setPasswordMock).toHaveBeenCalledWith("hunter22");
    expect(pushMock).toHaveBeenCalledWith("/account");
  });

  it("shows an error and stays on the password step if the passwords don't match", async () => {
    const user = userEvent.setup();
    render(<EmailSignupForm redirectPath="/account" />);

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.click(screen.getByRole("button", { name: /Send verification code/ }));
    await user.type(await screen.findByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: /Verify code/ }));

    await user.type(await screen.findByLabelText("Password"), "hunter22");
    await user.type(screen.getByLabelText("Confirm password"), "different1");
    await user.click(screen.getByRole("button", { name: /Create account/ }));

    expect(await screen.findByText(/don't match/)).toBeInTheDocument();
    expect(setPasswordMock).not.toHaveBeenCalled();
  });

  it("shows an error if the OTP code is wrong", async () => {
    verifyEmailOtpMock.mockRejectedValue(new Error("invalid token"));
    const user = userEvent.setup();
    render(<EmailSignupForm redirectPath="/account" />);

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.click(screen.getByRole("button", { name: /Send verification code/ }));
    await user.type(await screen.findByLabelText("Verification code"), "000000");
    await user.click(screen.getByRole("button", { name: /Verify code/ }));

    expect(await screen.findByText(/isn't right or has expired/)).toBeInTheDocument();
  });
});
