import { describe, expect, it, vi, afterEach } from "vitest";
import { createNomodCheckoutSession, getNomodCheckoutStatus, NomodCheckoutError } from "./nomod";

const lineItems = [{ productId: "p1", name: "ThinkPad X1", priceCents: 89900, quantity: 2 }];

describe("createNomodCheckoutSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NOMOD_API_KEY;
    delete process.env.NEXT_PUBLIC_STORE_CURRENCY;
  });

  it("throws when NOMOD_API_KEY is missing", async () => {
    await expect(
      createNomodCheckoutSession(lineItems, "ref-1", "https://s", "https://f", "https://c")
    ).rejects.toBeInstanceOf(NomodCheckoutError);
  });

  it("throws on an empty cart", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    await expect(
      createNomodCheckoutSession([], "ref-1", "https://s", "https://f", "https://c")
    ).rejects.toThrow(/empty cart/);
  });

  it("sends the real Nomod request shape: POST /v1/checkout, X-API-KEY header, decimal-string amounts", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    process.env.NEXT_PUBLIC_STORE_CURRENCY = "AED";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "session-1", url: "https://checkout.nomod.com/session-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createNomodCheckoutSession(
      lineItems,
      "ref-1",
      "https://example.com/success",
      "https://example.com/failed",
      "https://example.com/cancelled"
    );

    expect(result).toEqual({
      checkoutUrl: "https://checkout.nomod.com/session-1",
      sessionId: "session-1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.nomod.com/v1/checkout");
    expect(init.headers["X-API-KEY"]).toBe("sk_test_x");
    expect(init.headers["Authorization"]).toBeUndefined();

    const body = JSON.parse(init.body);
    expect(body.reference_id).toBe("ref-1");
    expect(body.currency).toBe("AED");
    expect(body.amount).toBe("1798.00"); // 89900 cents * 2, as a decimal string
    expect(body.success_url).toBe("https://example.com/success");
    expect(body.failure_url).toBe("https://example.com/failed");
    expect(body.cancelled_url).toBe("https://example.com/cancelled");
    expect(body.items).toEqual([
      {
        item_id: "p1",
        name: "ThinkPad X1",
        quantity: 2,
        unit_amount: "899.00",
        total_amount: "1798.00",
        net_amount: "1798.00",
      },
    ]);
  });

  it("throws NomodCheckoutError with the response body on a non-2xx response", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { code: "not_authenticated" } }),
      })
    );

    await expect(
      createNomodCheckoutSession(lineItems, "ref-1", "https://s", "https://f", "https://c")
    ).rejects.toMatchObject({ status: 401 });
  });

  it("throws NomodCheckoutError when the response shape is unexpected", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    await expect(
      createNomodCheckoutSession(lineItems, "ref-1", "https://s", "https://f", "https://c")
    ).rejects.toThrow(/unexpected response shape/);
  });
});

describe("getNomodCheckoutStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NOMOD_API_KEY;
  });

  it("throws when NOMOD_API_KEY is missing", async () => {
    await expect(getNomodCheckoutStatus("nomod-1")).rejects.toBeInstanceOf(NomodCheckoutError);
  });

  it("calls GET /v1/checkout/{id} with the X-API-KEY header and maps the response", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "nomod-1",
        status: "paid",
        amount: 899,
        currency: "AED",
        reference_id: "ref-1",
        customer: { email: "buyer@example.com", first_name: "A", last_name: "B" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getNomodCheckoutStatus("nomod-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.nomod.com/v1/checkout/nomod-1",
      expect.objectContaining({ headers: { "X-API-KEY": "sk_test_x" } })
    );
    expect(result).toEqual({
      id: "nomod-1",
      status: "paid",
      amount: 899,
      currency: "AED",
      referenceId: "ref-1",
      customerEmail: "buyer@example.com",
      customerName: "A B",
    });
  });

  it("handles a null customer without throwing", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "nomod-1", status: "created", customer: null }),
      })
    );

    const result = await getNomodCheckoutStatus("nomod-1");
    expect(result.customerEmail).toBeNull();
    expect(result.customerName).toBeNull();
  });

  it("throws NomodCheckoutError on a non-2xx response", async () => {
    process.env.NOMOD_API_KEY = "sk_test_x";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "not found" })
    );

    await expect(getNomodCheckoutStatus("missing")).rejects.toMatchObject({ status: 404 });
  });
});
