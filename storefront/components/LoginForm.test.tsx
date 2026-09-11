import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

const signInWithGoogleMock = vi.fn();
const signInWithPasswordMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signInWithGoogle: signInWithGoogleMock, signInWithPassword: signInWithPasswordMock }),
}));

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    signInWithPasswordMock.mockReset();
    signInWithPasswordMock.mockResolvedValue(undefined);
    mockSearchParams = new URLSearchParams();
  });

  it("shows Google and real email/password sign-in — no fake Apple/GitHub options", () => {
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /Continue with Google/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/)).toBeInTheDocument();
    expect(screen.queryByText(/Apple/)).not.toBeInTheDocument();
    expect(screen.queryByText(/GitHub/)).not.toBeInTheDocument();
  });

  it("links to the signup page, preserving the ?next= redirect", () => {
    mockSearchParams = new URLSearchParams({ next: "/products/thinkpad-x1" });
    render(<LoginForm />);

    const signUpLink = screen.getByRole("link", { name: /Sign up/ });
    expect(signUpLink).toHaveAttribute("href", `/signup?next=${encodeURIComponent("/products/thinkpad-x1")}`);
  });

  it("signs in with Google, redirecting to /account by default", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /Continue with Google/ }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/account");
  });

  it("redirects to the ?next= path when given", async () => {
    mockSearchParams = new URLSearchParams({ next: "/products/thinkpad-x1" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /Continue with Google/ }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/products/thinkpad-x1");
  });

  it("shows an error message if starting sign-in fails", async () => {
    signInWithGoogleMock.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /Continue with Google/ }));

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("links back home", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
  });

  it("shows real trust claims, not a fabricated testimonial", () => {
    render(<LoginForm />);
    expect(screen.getByText("90-day warranty")).toBeInTheDocument();
    expect(screen.queryByText(/Ali Hassan/)).not.toBeInTheDocument();
  });
});
