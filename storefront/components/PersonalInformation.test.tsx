import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonalInformation } from "./PersonalInformation";

const updateProfileMock = vi.fn();
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ updateProfile: updateProfileMock }),
}));

describe("PersonalInformation", () => {
  beforeEach(() => {
    updateProfileMock.mockReset();
    updateProfileMock.mockResolvedValue(undefined);
  });

  it("shows the current name and email, and saves an updated name", async () => {
    const user = userEvent.setup();
    render(<PersonalInformation initialName="Buyer Bee" email="buyer@example.com" />);

    expect(screen.getByLabelText("Full name")).toHaveValue("Buyer Bee");
    expect(screen.getByLabelText("Email")).toHaveValue("buyer@example.com");
    expect(screen.getByLabelText("Email")).toBeDisabled();

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "New Name");
    await user.click(screen.getByRole("button", { name: /Save changes/ }));

    expect(updateProfileMock).toHaveBeenCalledWith("New Name");
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });
});
