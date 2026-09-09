import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSignOutButton } from "./AccountSignOutButton";

const signOutMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ signOut: signOutMock }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

describe("AccountSignOutButton", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    signOutMock.mockResolvedValue(undefined);
    refreshMock.mockReset();
  });

  it("signs out and refreshes the page so server-rendered account state updates", async () => {
    const user = userEvent.setup();
    render(<AccountSignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOutMock).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });
});
