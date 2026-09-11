import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordManager } from "./PasswordManager";

const signInWithPasswordMock = vi.fn();
const setPasswordMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signInWithPassword: signInWithPasswordMock, setPassword: setPasswordMock }),
}));

describe("PasswordManager", () => {
  beforeEach(() => {
    signInWithPasswordMock.mockReset();
    signInWithPasswordMock.mockResolvedValue(undefined);
    setPasswordMock.mockReset();
    setPasswordMock.mockResolvedValue(undefined);
  });

  it("for an account with a password, verifies the current password before setting the new one", async () => {
    const user = userEvent.setup();
    render(<PasswordManager email="buyer@example.com" hasPassword />);

    expect(screen.getByLabelText("Password *")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Password *"), "old-password");
    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password1");
    await user.click(screen.getByRole("button", { name: /Update password/ }));

    expect(signInWithPasswordMock).toHaveBeenCalledWith("buyer@example.com", "old-password");
    expect(setPasswordMock).toHaveBeenCalledWith("new-password1");
    expect(await screen.findByText("Password updated.")).toBeInTheDocument();
  });

  it("for a Google-only account, skips the current-password field entirely", async () => {
    const user = userEvent.setup();
    render(<PasswordManager email="buyer@example.com" hasPassword={false} />);

    expect(screen.queryByLabelText("Password *")).not.toBeInTheDocument();
    expect(screen.getByText(/signed up with Google/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password1");
    await user.click(screen.getByRole("button", { name: /Update password/ }));

    expect(signInWithPasswordMock).not.toHaveBeenCalled();
    expect(setPasswordMock).toHaveBeenCalledWith("new-password1");
  });

  it("shows an error and doesn't call setPassword when the current password is wrong", async () => {
    signInWithPasswordMock.mockRejectedValue(new Error("invalid credentials"));
    const user = userEvent.setup();
    render(<PasswordManager email="buyer@example.com" hasPassword />);

    await user.type(screen.getByLabelText("Password *"), "wrong-password");
    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password1");
    await user.click(screen.getByRole("button", { name: /Update password/ }));

    expect(await screen.findByText(/current password is incorrect/)).toBeInTheDocument();
    expect(setPasswordMock).not.toHaveBeenCalled();
  });

  it("shows an error when the new passwords don't match", async () => {
    const user = userEvent.setup();
    render(<PasswordManager email="buyer@example.com" hasPassword={false} />);

    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(screen.getByLabelText("Confirm new password"), "different-password");
    await user.click(screen.getByRole("button", { name: /Update password/ }));

    expect(await screen.findByText(/don't match/)).toBeInTheDocument();
    expect(setPasswordMock).not.toHaveBeenCalled();
  });
});
