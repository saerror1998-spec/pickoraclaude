import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./SignupForm";

const signInWithGoogleMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signInWithGoogle: signInWithGoogleMock }),
}));

vi.mock("./EmailSignupForm", () => ({
  EmailSignupForm: () => <div data-testid="email-signup-form" />,
}));

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("SignupForm", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    mockSearchParams = new URLSearchParams();
  });

  it("signs up with Google, redirecting to /account by default", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /Continue with Google/ }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/account");
  });

  it("links back to sign in, preserving the ?next= redirect", () => {
    mockSearchParams = new URLSearchParams({ next: "/products/thinkpad-x1" });
    render(<SignupForm />);

    const signInLink = screen.getByRole("link", { name: /Sign in/ });
    expect(signInLink).toHaveAttribute("href", `/login?next=${encodeURIComponent("/products/thinkpad-x1")}`);
  });

  it("renders the email signup form", () => {
    render(<SignupForm />);
    expect(screen.getByTestId("email-signup-form")).toBeInTheDocument();
  });
});
