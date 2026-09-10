import { describe, expect, it } from "vitest";
import { brandMeta, brandSlug } from "./brand-meta";

describe("brandSlug", () => {
  it("lowercases and hyphenates the brand name", () => {
    expect(brandSlug("Dell")).toBe("dell");
    expect(brandSlug("HP")).toBe("hp");
  });
});

describe("brandMeta", () => {
  it("returns real dedicated copy for a known brand", () => {
    const meta = brandMeta("Dell");
    expect(meta.title).toBe("Refurbished Dell Laptops in the UAE | Latitude & Inspiron | Pickora");
    expect(meta.description).toContain("Latitude");
  });

  it("returns a genuinely unique (not shared-generic) title for an unknown brand", () => {
    const meta = brandMeta("Asus");
    expect(meta.title).toBe("Refurbished Asus Laptops UAE | Pickora");
    expect(meta.intro).toContain("Asus");
  });
});
