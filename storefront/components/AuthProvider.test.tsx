import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthProvider";

const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signInWithOAuthMock = vi.fn();
const signOutMock = vi.fn();
const unsubscribeMock = vi.fn();

vi.mock("@/lib/supabase/browser-client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: getUserMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
    },
  }),
}));

function TestHarness() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="user">{user ? user.id : "none"}</p>
      <button onClick={() => signInWithGoogle("/products/x")}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>
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

  it("useAuth throws outside of AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestHarness />)).toThrow(/useAuth must be used within an AuthProvider/);
    consoleError.mockRestore();
  });
});
