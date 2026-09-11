import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailPasswordLoginForm } from "./EmailPasswordLoginForm";

const signInWithPasswordMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signInWithPassword: signInWithPasswordMock }),
}));

describe("EmailPasswordLoginForm", () => {
  const originalAssign = window.location.assign;

  beforeEach(() => {
    signInWithPasswordMock.mockReset();
    signInWithPasswordMock.mockResolvedValue(undefined);
    // jsdom doesn't implement navigation — stub it so the success path doesn't error.
    Object.defineProperty(window, "location", {
      value: { ...window.location, assign: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { value: { ...window.location, assign: originalAssign }, writable: true });
  });

  it("signs in with email and password", async () => {
    const user = userEvent.setup();
    render(<EmailPasswordLoginForm redirectPath="/account" />);

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter22");
    await user.click(screen.getByRole("button", { name: /Sign in/ }));

    expect(signInWithPasswordMock).toHaveBeenCalledWith("buyer@example.com", "hunter22");
    expect(window.location.assign).toHaveBeenCalledWith("/account");
  });

  it("shows an error when the credentials are wrong", async () => {
    signInWithPasswordMock.mockRejectedValue(new Error("invalid credentials"));
    const user = userEvent.setup();
    render(<EmailPasswordLoginForm redirectPath="/account" />);

    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /Sign in/ }));

    expect(await screen.findByText(/don't match/)).toBeInTheDocument();
  });

  it("links to the reset-password page", () => {
    render(<EmailPasswordLoginForm redirectPath="/account" />);
    expect(screen.getByRole("link", { name: /Forgot password/ })).toHaveAttribute("href", "/reset-password");
  });
});
