import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSessionMock = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  }),
}));

const { GET } = await import("./route");

function makeRequest(searchParams: Record<string, string>) {
  const url = new URL("http://localhost:3000/auth/callback");
  for (const [key, value] of Object.entries(searchParams)) url.searchParams.set(key, value);
  return new NextRequest(url);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSessionMock.mockReset();
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("redirects to / with an error when there's no code", async () => {
    const response = await GET(makeRequest({}));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("auth_error=missing_code");
  });

  it("exchanges the code and redirects to the requested `next` path on success", async () => {
    const response = await GET(makeRequest({ code: "abc123", next: "/products/thinkpad-x1" }));

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc123");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/products/thinkpad-x1");
  });

  it("defaults to / when no `next` param is given", async () => {
    const response = await GET(makeRequest({ code: "abc123" }));
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to / with an error when the code exchange fails", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: { message: "invalid code" } });

    const response = await GET(makeRequest({ code: "bad-code" }));

    expect(response.headers.get("location")).toContain("auth_error=exchange_failed");
  });

  it("redirects to / with an error when Supabase isn't configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const response = await GET(makeRequest({ code: "abc123" }));

    expect(response.headers.get("location")).toContain("auth_error=not_configured");
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
  });
});
