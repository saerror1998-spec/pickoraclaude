import { describe, expect, it } from "vitest";
import { formatPrice, formatCompactNumber, formatBytes } from "./format";

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

describe("formatBytes", () => {
  it("formats zero as 0 B", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes below 1KB with no decimal", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatBytes(314572800)).toBe("300.0 MB");
  });

  it("formats gigabytes with one decimal", () => {
    expect(formatBytes(2 * 1024 ** 3)).toBe("2.0 GB");
  });
});
