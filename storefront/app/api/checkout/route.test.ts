import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const createPendingOrderMock = vi.fn();
vi.mock("@/lib/orders", () => ({
  createPendingOrder: (...args: unknown[]) => createPendingOrderMock(...args),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    createPendingOrderMock.mockReset();
    createPendingOrderMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NOMOD_API_KEY;
  });

  it("rejects a request with no lineItems", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("rejects a lineItem missing required fields", async () => {
    const response = await POST(makeRequest({ lineItems: [{ productId: "1" }] }));
    expect(response.status).toBe(400);
  });

  it("returns 502 when NOMOD_API_KEY is not configured", async () => {
    const response = await POST(
      makeRequest({
        lineItems: [{ productId: "1", name: "Laptop", priceCents: 1000, quantity: 1 }],
      })
    );
    const payload = await response.json();
    expect(response.status).toBe(502);
    expect(payload.error).toMatch(/NOMOD_API_KEY/);
  });

  it("returns a checkout session on success and includes ?order= in every redirect URL", async () => {
    process.env.NOMOD_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://checkout.nomod.com/s1", id: "s1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({
        lineItems: [{ productId: "1", name: "Laptop", priceCents: 1000, quantity: 1 }],
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ checkoutUrl: "https://checkout.nomod.com/s1", sessionId: "s1" });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    for (const url of [requestBody.success_url, requestBody.failure_url, requestBody.cancelled_url]) {
      expect(url).toMatch(/\?order=pickora-/);
    }
  });

  it("creates a pending order record after a successful Nomod session", async () => {
    process.env.NOMOD_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: "https://checkout.nomod.com/s1", id: "s1" }),
      })
    );

    await POST(
      makeRequest({
        lineItems: [{ productId: "1", name: "Laptop", priceCents: 1000, quantity: 2 }],
      })
    );

    expect(createPendingOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({ nomodCheckoutId: "s1", totalCents: 2000 })
    );
  });

  it("still returns the checkout session even if order persistence fails", async () => {
    process.env.NOMOD_API_KEY = "test-key";
    createPendingOrderMock.mockRejectedValue(new Error("db down"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: "https://checkout.nomod.com/s1", id: "s1" }),
      })
    );

    const response = await POST(
      makeRequest({
        lineItems: [{ productId: "1", name: "Laptop", priceCents: 1000, quantity: 1 }],
      })
    );

    expect(response.status).toBe(200);
  });

  it("propagates a Nomod API error as a non-200 response", async () => {
    process.env.NOMOD_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "unauthorized" })
    );

    const response = await POST(
      makeRequest({
        lineItems: [{ productId: "1", name: "Laptop", priceCents: 1000, quantity: 1 }],
      })
    );

    expect(response.status).toBe(401);
  });
});
