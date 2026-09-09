import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "./CartProvider";
import { MobileDock } from "./MobileDock";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const signInWithGoogleMock = vi.fn();
const signOutMock = vi.fn();
let mockUser: { id: string } | null = null;

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signInWithGoogle: signInWithGoogleMock,
    signOut: signOutMock,
  }),
}));

describe("MobileDock", () => {
  beforeEach(() => {
    signInWithGoogleMock.mockReset();
    signInWithGoogleMock.mockResolvedValue(undefined);
    signOutMock.mockReset();
    mockUser = null;
  });

  it("renders a spacer before the fixed nav so page content isn't covered", () => {
    const { container } = render(
      <CartProvider>
        <MobileDock />
      </CartProvider>
    );

    // The spacer is a plain, non-fixed div; the nav itself is `fixed`.
    const spacer = container.querySelector("div[aria-hidden]");
    const nav = container.querySelector("nav");
    expect(spacer).toBeInTheDocument();
    expect(spacer?.className).not.toContain("fixed");
    expect(nav?.className).toContain("fixed");
    // Spacer must come before the fixed nav in the DOM so it occupies real
    // flow space above it, not after.
    const position = spacer!.compareDocumentPosition(nav!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("triggers Google sign-in when signed out and the account button is tapped", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <MobileDock />
      </CartProvider>
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signInWithGoogleMock).toHaveBeenCalledWith("/");
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("links to the account page when already signed in", () => {
    mockUser = { id: "user-1" };
    render(
      <CartProvider>
        <MobileDock />
      </CartProvider>
    );

    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
