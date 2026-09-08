import { describe, expect, it } from "vitest";
import { formatPrice, formatCompactNumber } from "./format";

describe("formatPrice", () => {
  it("formats cents as whole-dollar USD", () => {
    expect(formatPrice(15460)).toBe("$155");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatCompactNumber", () => {
  it("compacts thousands", () => {
    expect(formatCompactNumber(38200)).toBe("38.2K");
  });

  it("leaves small numbers unabbreviated", () => {
    expect(formatCompactNumber(842)).toBe("842");
  });
});
