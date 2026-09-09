import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountMenu } from "./AccountMenu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/products/thinkpad-x1",
}));

const signInWithGoogleMock = vi.fn();
const signOutMock = vi.fn();
let mockUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;
let mockLoading = false;

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    signInWithGoogle: signInWithGoogleMock,
    signOut: signOutMock,
  }),
}));

describe("AccountMenu", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    signOutMock.mockReset();
    mockUser = null;
    mockLoading = false;
  });

  it("shows a loading placeholder while the initial auth check runs", () => {
    mockLoading = true;
    const { container } = render(<AccountMenu />);
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows Sign in when signed out, and triggers Google sign-in with the current path", async () => {
    const user = userEvent.setup();
    render(<AccountMenu />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/products/thinkpad-x1");
  });

  it("shows the user's initial when signed in with no avatar, and links to the account page", () => {
    mockUser = { id: "user-1", email: "buyer@example.com" };
    render(<AccountMenu />);

    expect(screen.getByText("B")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Signed in as buyer@example.com/ });
    expect(link).toHaveAttribute("href", "/account");
  });
});
