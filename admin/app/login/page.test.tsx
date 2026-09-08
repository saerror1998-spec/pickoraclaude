import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/browser-client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInWithPasswordMock.mockReset();
  });

  it("signs in and redirects to / on success", async () => {
    const user = userEvent.setup();
    signInWithPasswordMock.mockResolvedValue({ error: null });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "hello@pickoraonline.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "hello@pickoraonline.com",
      password: "correct-password",
    });
  });

  it("shows an error message on invalid credentials", async () => {
    const user = userEvent.setup();
    signInWithPasswordMock.mockResolvedValue({ error: { message: "Invalid login credentials" } });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "hello@pickoraonline.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid login credentials");
    expect(pushMock).not.toHaveBeenCalled();
  });
});
