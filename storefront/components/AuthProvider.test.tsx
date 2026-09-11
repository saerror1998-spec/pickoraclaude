import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthProvider";

const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signInWithOAuthMock = vi.fn();
const signOutMock = vi.fn();
const unsubscribeMock = vi.fn();
const signInWithOtpMock = vi.fn();
const verifyOtpMock = vi.fn();
const updateUserMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const resetPasswordForEmailMock = vi.fn();

vi.mock("@/lib/supabase/browser-client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: getUserMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
      signInWithOtp: signInWithOtpMock,
      verifyOtp: verifyOtpMock,
      updateUser: updateUserMock,
      signInWithPassword: signInWithPasswordMock,
      resetPasswordForEmail: resetPasswordForEmailMock,
    },
  }),
}));

function TestHarness() {
  const {
    user,
    loading,
    signInWithGoogle,
    signOut,
    sendEmailOtp,
    verifyEmailOtp,
    setPassword,
    signInWithPassword,
    sendPasswordReset,
    updateProfile,
  } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="user">{user ? user.id : "none"}</p>
      <button onClick={() => signInWithGoogle("/products/x")}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>
      <button onClick={() => sendEmailOtp("buyer@example.com")}>Send OTP</button>
      <button onClick={() => verifyEmailOtp("buyer@example.com", "123456")}>Verify OTP</button>
      <button onClick={() => setPassword("hunter2!")}>Set password</button>
      <button onClick={() => signInWithPassword("buyer@example.com", "hunter2!")}>Password sign-in</button>
      <button onClick={() => sendPasswordReset("buyer@example.com")}>Reset password</button>
      <button onClick={() => updateProfile("Buyer One")}>Update profile</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: null } });
    onAuthStateChangeMock.mockReset();
    onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe: unsubscribeMock } } });
    signInWithOAuthMock.mockReset();
    signInWithOAuthMock.mockResolvedValue({ error: null });
    signOutMock.mockReset();
    signOutMock.mockResolvedValue({ error: null });
    signInWithOtpMock.mockReset();
    signInWithOtpMock.mockResolvedValue({ error: null });
    verifyOtpMock.mockReset();
    verifyOtpMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    updateUserMock.mockReset();
    updateUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    signInWithPasswordMock.mockReset();
    signInWithPasswordMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    resetPasswordForEmailMock.mockReset();
    resetPasswordForEmailMock.mockResolvedValue({ error: null });
  });

  it("starts loading, then resolves to signed-out when there's no session", async () => {
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("reflects the real session when one exists", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("user-1"));
  });

  it("signInWithGoogle calls signInWithOAuth with a Google provider and a callback redirect that preserves the return path", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Sign in"));

    expect(signInWithOAuthMock).toHaveBeenCalledTimes(1);
    const call = signInWithOAuthMock.mock.calls[0][0];
    expect(call.provider).toBe("google");
    expect(call.options.redirectTo).toContain("/auth/callback");
    expect(call.options.redirectTo).toContain(encodeURIComponent("/products/x"));
  });

  it("signOut calls Supabase signOut and clears the local user", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("user-1"));

    await user.click(screen.getByText("Sign out"));

    expect(signOutMock).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("none"));
  });

  it("sendEmailOtp calls signInWithOtp allowing signup", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Send OTP"));

    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: "buyer@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("verifyEmailOtp calls verifyOtp and signs the user in on success", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Verify OTP"));

    expect(verifyOtpMock).toHaveBeenCalledWith({ email: "buyer@example.com", token: "123456", type: "email" });
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("user-1"));
  });

  it("setPassword calls updateUser with the new password", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Set password"));

    expect(updateUserMock).toHaveBeenCalledWith({ password: "hunter2!" });
  });

  it("signInWithPassword calls signInWithPassword and signs the user in", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Password sign-in"));

    expect(signInWithPasswordMock).toHaveBeenCalledWith({ email: "buyer@example.com", password: "hunter2!" });
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("user-1"));
  });

  it("sendPasswordReset calls resetPasswordForEmail with a redirect back to /reset-password", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Reset password"));

    expect(resetPasswordForEmailMock).toHaveBeenCalledTimes(1);
    const [email, options] = resetPasswordForEmailMock.mock.calls[0];
    expect(email).toBe("buyer@example.com");
    expect(options.redirectTo).toContain("/reset-password");
  });

  it("updateProfile calls updateUser with the new display name", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Update profile"));

    expect(updateUserMock).toHaveBeenCalledWith({ data: { full_name: "Buyer One" } });
  });

  it("useAuth throws outside of AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestHarness />)).toThrow(/useAuth must be used within an AuthProvider/);
    consoleError.mockRestore();
  });
});
