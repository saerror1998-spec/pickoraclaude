import { describe, expect, it, vi, beforeEach } from "vitest";

const getSupabaseAdminClientMock = vi.fn();
const getSupabaseClientMock = vi.fn();

vi.mock("./supabase/admin-server", () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClientMock(),
}));
vi.mock("./supabase/client", () => ({
  getSupabaseClient: () => getSupabaseClientMock(),
}));

describe("fetchDashboardOverview", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
    getSupabaseClientMock.mockReset();
  });

  it("falls back to sample data when the service role key isn't configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchDashboardOverview } = await import("./admin-data");
    const { SAMPLE_DASHBOARD } = await import("./sample-data");

    const overview = await fetchDashboardOverview();
    expect(overview).toEqual(SAMPLE_DASHBOARD);
  });

  it("falls back to sample data when the orders table query errors (e.g. table missing)", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => Promise.resolve({ error: { message: "relation does not exist" } }),
      }),
    });
    const { fetchDashboardOverview } = await import("./admin-data");
    const { SAMPLE_DASHBOARD } = await import("./sample-data");

    const overview = await fetchDashboardOverview();
    expect(overview).toEqual(SAMPLE_DASHBOARD);
  });

  it("throws AdminDataError when the Supabase client itself throws", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => {
        throw new Error("network down");
      },
    });
    const { fetchDashboardOverview, AdminDataError } = await import("./admin-data");

    await expect(fetchDashboardOverview()).rejects.toBeInstanceOf(AdminDataError);
  });
});

describe("fetchAdminProducts", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
    getSupabaseClientMock.mockReset();
  });

  it("returns an empty array when Supabase isn't configured", async () => {
    getSupabaseClientMock.mockReturnValue(null);
    const { fetchAdminProducts } = await import("./admin-data");

    expect(await fetchAdminProducts()).toEqual([]);
  });

  it("maps snake_case rows to AdminProduct", async () => {
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [
                {
                  id: "1",
                  name: "ThinkPad X1",
                  brand: "Lenovo",
                  price_cents: 89900,
                  in_stock: true,
                  condition: "Excellent",
                },
              ],
              error: null,
            }),
        }),
      }),
    });
    const { fetchAdminProducts } = await import("./admin-data");

    const products = await fetchAdminProducts();
    expect(products).toEqual([
      { id: "1", name: "ThinkPad X1", brand: "Lenovo", priceCents: 89900, inStock: true, condition: "Excellent" },
    ]);
  });

  it("throws AdminDataError when the query errors", async () => {
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: null, error: { message: "boom" } }),
        }),
      }),
    });
    const { fetchAdminProducts, AdminDataError } = await import("./admin-data");

    await expect(fetchAdminProducts()).rejects.toBeInstanceOf(AdminDataError);
  });
});

const ORDER_ROW_A = {
  id: "o1",
  reference_id: "pickora-1",
  nomod_checkout_id: "nomod-1",
  status: "paid",
  total_cents: 96500,
  currency: "AED",
  customer_email: "buyer@example.com",
  customer_name: "Buyer One",
  line_items: [{ productId: "p1", name: "ThinkPad", priceCents: 96500, quantity: 1 }],
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-01T10:05:00.000Z",
};

const ORDER_ROW_B = {
  id: "o2",
  reference_id: "pickora-2",
  nomod_checkout_id: "nomod-2",
  status: "enabled",
  total_cents: 50000,
  currency: "AED",
  customer_email: "buyer@example.com",
  customer_name: null,
  line_items: [{ productId: "p2", name: "MacBook", priceCents: 50000, quantity: 1 }],
  created_at: "2026-09-02T10:00:00.000Z",
  updated_at: "2026-09-02T10:00:00.000Z",
};

describe("fetchAdminOrders", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("returns an empty array when Supabase isn't configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchAdminOrders } = await import("./admin-data");

    expect(await fetchAdminOrders()).toEqual([]);
  });

  it("maps snake_case order rows to AdminOrder", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [ORDER_ROW_A], error: null }),
        }),
      }),
    });
    const { fetchAdminOrders } = await import("./admin-data");

    const orders = await fetchAdminOrders();
    expect(orders).toEqual([
      {
        id: "o1",
        referenceId: "pickora-1",
        nomodCheckoutId: "nomod-1",
        status: "paid",
        totalCents: 96500,
        currency: "AED",
        customerEmail: "buyer@example.com",
        customerName: "Buyer One",
        lineItems: [{ productId: "p1", name: "ThinkPad", priceCents: 96500, quantity: 1 }],
        createdAt: "2026-09-01T10:00:00.000Z",
        updatedAt: "2026-09-01T10:05:00.000Z",
      },
    ]);
  });

  it("throws AdminDataError when the query errors", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: null, error: { message: "boom" } }),
        }),
      }),
    });
    const { fetchAdminOrders, AdminDataError } = await import("./admin-data");

    await expect(fetchAdminOrders()).rejects.toBeInstanceOf(AdminDataError);
  });
});

describe("fetchAdminCustomers", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("returns an empty array when there are no orders", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchAdminCustomers } = await import("./admin-data");

    expect(await fetchAdminCustomers()).toEqual([]);
  });

  it("groups multiple orders from the same email into one customer", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [ORDER_ROW_B, ORDER_ROW_A], error: null }),
        }),
      }),
    });
    const { fetchAdminCustomers } = await import("./admin-data");

    const customers = await fetchAdminCustomers();
    expect(customers).toHaveLength(1);
    expect(customers[0]).toMatchObject({
      email: "buyer@example.com",
      name: "Buyer One", // filled in from whichever order has it
      orderCount: 2,
      paidOrderCount: 1, // only ORDER_ROW_A is "paid"; ORDER_ROW_B is "enabled" (unpaid)
      totalSpentCents: 96500, // only the paid order counts toward spend
      lastOrderAt: "2026-09-02T10:00:00.000Z", // the more recent order
    });
  });

  it("excludes orders with no customer email (never reached checkout)", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [{ ...ORDER_ROW_A, customer_email: null }],
              error: null,
            }),
        }),
      }),
    });
    const { fetchAdminCustomers } = await import("./admin-data");

    expect(await fetchAdminCustomers()).toEqual([]);
  });
});
