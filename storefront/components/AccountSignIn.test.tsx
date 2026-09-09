import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSignIn } from "./AccountSignIn";

const signInWithGoogleMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signInWithGoogle: signInWithGoogleMock }),
}));

describe("AccountSignIn", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
  });

  it("triggers Google sign-in with a redirect back to /account", async () => {
    const user = userEvent.setup();
    render(<AccountSignIn />);

    await user.click(screen.getByRole("button", { name: "Sign in with Google" }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/account");
  });
});
