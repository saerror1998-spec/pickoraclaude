import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CartProvider } from "./CartProvider";
import { MobileDock } from "./MobileDock";

describe("MobileDock", () => {
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
});
