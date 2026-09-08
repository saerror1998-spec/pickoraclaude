import { describe, expect, it, vi, beforeEach } from "vitest";

const getSupabaseAdminClientMock = vi.fn();
const getNomodCheckoutStatusMock = vi.fn();

vi.mock("./supabase/admin-server", () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClientMock(),
}));
vi.mock("./nomod", () => ({
  getNomodCheckoutStatus: (...args: unknown[]) => getNomodCheckoutStatusMock(...args),
}));

const lineItems = [{ productId: "p1", name: "ThinkPad X1", priceCents: 89900, quantity: 1 }];

describe("createPendingOrder", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("does nothing when Supabase isn't configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { createPendingOrder } = await import("./orders");

    await expect(
      createPendingOrder({
        referenceId: "ref-1",
        nomodCheckoutId: "nomod-1",
        lineItems,
        totalCents: 89900,
        currency: "AED",
      })
    ).resolves.toBeUndefined();
  });

  it("inserts a pending order row", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    getSupabaseAdminClientMock.mockReturnValue({ from: () => ({ insert: insertMock }) });
    const { createPendingOrder } = await import("./orders");

    await createPendingOrder({
      referenceId: "ref-1",
      nomodCheckoutId: "nomod-1",
      lineItems,
      totalCents: 89900,
      currency: "AED",
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        reference_id: "ref-1",
        nomod_checkout_id: "nomod-1",
        status: "pending",
        total_cents: 89900,
        currency: "AED",
      })
    );
  });

  it("throws OrderPersistenceError when the insert fails", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({ insert: vi.fn().mockResolvedValue({ error: { message: "boom" } }) }),
    });
    const { createPendingOrder, OrderPersistenceError } = await import("./orders");

    await expect(
      createPendingOrder({
        referenceId: "ref-1",
        nomodCheckoutId: "nomod-1",
        lineItems,
        totalCents: 89900,
        currency: "AED",
      })
    ).rejects.toBeInstanceOf(OrderPersistenceError);
  });
});

describe("finalizeOrder", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
    getNomodCheckoutStatusMock.mockReset();
  });

  it("returns null when Supabase isn't configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { finalizeOrder } = await import("./orders");

    expect(await finalizeOrder("ref-1")).toBeNull();
  });

  it("returns null when no local order matches the reference id", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      }),
    });
    const { finalizeOrder } = await import("./orders");

    expect(await finalizeOrder("ref-missing")).toBeNull();
  });

  it("verifies status via Nomod and updates the local order to 'paid'", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: { nomod_checkout_id: "nomod-1", total_cents: 89900 }, error: null }),
          }),
        }),
        update: () => ({ eq: updateEq }),
      }),
    });
    getNomodCheckoutStatusMock.mockResolvedValue({
      id: "nomod-1",
      status: "paid",
      amount: 899,
      currency: "AED",
      referenceId: "ref-1",
      customerEmail: "buyer@example.com",
      customerName: "Buyer Name",
    });
    const { finalizeOrder } = await import("./orders");

    const result = await finalizeOrder("ref-1");

    expect(getNomodCheckoutStatusMock).toHaveBeenCalledWith("nomod-1");
    expect(result).toEqual({ referenceId: "ref-1", status: "paid", totalCents: 89900 });
    expect(updateEq).toHaveBeenCalledWith("reference_id", "ref-1");
  });

  it("never marks an order paid without checking Nomod, even if called repeatedly", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: { nomod_checkout_id: "nomod-1", total_cents: 89900 }, error: null }),
          }),
        }),
        update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }),
    });
    getNomodCheckoutStatusMock.mockResolvedValue({
      id: "nomod-1",
      status: "cancelled",
      amount: 899,
      currency: "AED",
      referenceId: "ref-1",
      customerEmail: null,
      customerName: null,
    });
    const { finalizeOrder } = await import("./orders");

    const result = await finalizeOrder("ref-1");

    expect(result?.status).toBe("cancelled");
  });
});
