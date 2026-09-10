import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import CertificationPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/certification",
}));

function renderCertificationPage() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CertificationPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("CertificationPage", () => {
  it("lists all four real certification steps", () => {
    renderCertificationPage();

    for (const title of ["Diagnose", "Repair & replace", "Deep clean", "Grade & certify"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("links to the real warranty page", () => {
    renderCertificationPage();
    expect(screen.getByRole("link", { name: "Read the warranty" })).toHaveAttribute("href", "/warranty");
  });

  it("expands an FAQ item and includes FAQPage structured data", async () => {
    const user = userEvent.setup();
    const { container } = renderCertificationPage();

    await user.click(screen.getByText("Do all laptops pass certification?"));
    expect(screen.getByText(/Only units that pass diagnosis and repair/)).toBeInTheDocument();

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(jsonLd!.innerHTML)["@type"]).toBe("FAQPage");
  });
});
