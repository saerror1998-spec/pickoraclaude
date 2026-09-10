import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { resolvePublicOrigin } from "./request-origin";

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://0.0.0.0:3000/some/path", { headers });
}

describe("resolvePublicOrigin", () => {
  it("prefers X-Forwarded-Host/-Proto over the request's own (internal) origin", () => {
    const request = makeRequest({ "x-forwarded-host": "pickoraonline.com", "x-forwarded-proto": "https" });
    expect(resolvePublicOrigin(request)).toBe("https://pickoraonline.com");
  });

  it("defaults X-Forwarded-Proto to https when only X-Forwarded-Host is set", () => {
    const request = makeRequest({ "x-forwarded-host": "pickoraonline.com" });
    expect(resolvePublicOrigin(request)).toBe("https://pickoraonline.com");
  });

  it("falls back to the plain Host header when there's no X-Forwarded-Host", () => {
    const request = makeRequest({ host: "pickoraonline.com" });
    expect(resolvePublicOrigin(request)).toBe("https://pickoraonline.com");
  });

  it("falls back to the request's own origin when no proxy headers are present at all", () => {
    const request = makeRequest();
    expect(resolvePublicOrigin(request)).toBe("http://0.0.0.0:3000");
  });
});
