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

describe("fetchSalesOverview", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("returns all-zero data when there are no orders", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchSalesOverview } = await import("./admin-data");

    expect(await fetchSalesOverview()).toEqual({
      totalRevenueCents: 0,
      paidOrderCount: 0,
      averageOrderValueCents: 0,
      revenueTrend: [],
      topProducts: [],
      recentSales: [],
    });
  });

  it("counts only PAID orders toward revenue, AOV, and top products", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [ORDER_ROW_B, ORDER_ROW_A], error: null }),
        }),
      }),
    });
    const { fetchSalesOverview } = await import("./admin-data");

    const sales = await fetchSalesOverview();
    expect(sales.totalRevenueCents).toBe(96500); // ORDER_ROW_A only; ORDER_ROW_B is "enabled" (unpaid)
    expect(sales.paidOrderCount).toBe(1);
    expect(sales.averageOrderValueCents).toBe(96500);
    expect(sales.revenueTrend).toEqual([{ date: "Sep 1", value: 96500 }]);
    expect(sales.topProducts).toEqual([
      { productId: "p1", name: "ThinkPad", unitsSold: 1, revenueCents: 96500 },
    ]);
    expect(sales.recentSales.map((o) => o.id)).toEqual(["o1"]);
  });
});

describe("fetchStorageOverview", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("returns an empty overview when Supabase isn't configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchStorageOverview } = await import("./admin-data");

    expect(await fetchStorageOverview()).toEqual({ buckets: [], totalFileCount: 0, totalSizeBytes: 0 });
  });

  it("sums file count and size per bucket, skipping folder placeholder entries", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      storage: {
        listBuckets: () =>
          Promise.resolve({ data: [{ name: "product-images", public: true }], error: null }),
        from: () => ({
          list: () =>
            Promise.resolve({
              data: [
                { id: "f1", metadata: { size: 1000 } },
                { id: "f2", metadata: { size: 2000 } },
                { id: null, metadata: null }, // folder placeholder — not a real file
              ],
              error: null,
            }),
        }),
      },
    });
    const { fetchStorageOverview } = await import("./admin-data");

    expect(await fetchStorageOverview()).toEqual({
      buckets: [{ name: "product-images", public: true, fileCount: 2, totalSizeBytes: 3000 }],
      totalFileCount: 2,
      totalSizeBytes: 3000,
    });
  });

  it("throws AdminDataError when the storage API errors", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      storage: {
        listBuckets: () => Promise.resolve({ data: null, error: { message: "boom" } }),
      },
    });
    const { fetchStorageOverview, AdminDataError } = await import("./admin-data");

    await expect(fetchStorageOverview()).rejects.toBeInstanceOf(AdminDataError);
  });
});

describe("fetchCatalogComposition", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseClientMock.mockReset();
  });

  it("groups real products by condition and brand, and computes average price", async () => {
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [
                { id: "1", name: "A", brand: "Dell", price_cents: 80000, in_stock: true, condition: "Excellent" },
                { id: "2", name: "B", brand: "Dell", price_cents: 100000, in_stock: false, condition: "Good" },
              ],
              error: null,
            }),
        }),
      }),
    });
    const { fetchCatalogComposition } = await import("./admin-data");

    expect(await fetchCatalogComposition()).toEqual({
      totalProducts: 2,
      inStockCount: 1,
      soldOutCount: 1,
      byCondition: [
        { condition: "Excellent", count: 1 },
        { condition: "Good", count: 1 },
      ],
      byBrand: [{ brand: "Dell", count: 2 }],
      averagePriceCents: 90000,
    });
  });
});

describe("fetchIntegrationsStatus", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
  });

  it("reports Supabase pieces as not_configured and everything else as external when Supabase isn't set up", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    const { fetchIntegrationsStatus } = await import("./admin-data");

    const integrations = await fetchIntegrationsStatus();
    const byId = Object.fromEntries(integrations.map((i) => [i.id, i.status]));
    expect(byId).toEqual({
      "supabase-database": "not_configured",
      "supabase-storage": "not_configured",
      "google-auth": "external",
      nomod: "external",
      hostinger: "external",
    });
  });

  it("reports Supabase pieces as connected when live queries succeed", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => Promise.resolve({ error: null }),
      }),
      storage: {
        listBuckets: () => Promise.resolve({ data: [{ name: "product-images", public: true }], error: null }),
      },
    });
    const { fetchIntegrationsStatus } = await import("./admin-data");

    const integrations = await fetchIntegrationsStatus();
    const byId = Object.fromEntries(integrations.map((i) => [i.id, i.status]));
    expect(byId["supabase-database"]).toBe("connected");
    expect(byId["supabase-storage"]).toBe("connected");
  });
});

describe("fetchActivityFeed", () => {
  beforeEach(() => {
    vi.resetModules();
    getSupabaseAdminClientMock.mockReset();
    getSupabaseClientMock.mockReset();
  });

  it("returns an empty feed when nothing is configured", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    getSupabaseClientMock.mockReturnValue(null);
    const { fetchActivityFeed } = await import("./admin-data");

    expect(await fetchActivityFeed()).toEqual([]);
  });

  it("emits an order_placed event, and a separate order_status_changed event only when updated_at differs from created_at", async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [ORDER_ROW_A], error: null }),
        }),
      }),
    });
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    });
    const { fetchActivityFeed } = await import("./admin-data");

    const events = await fetchActivityFeed();
    expect(events).toEqual([
      {
        id: "o1-status",
        type: "order_status_changed",
        message: 'Order pickora-1 status changed to "paid"',
        detail: "buyer@example.com",
        timestamp: "2026-09-01T10:05:00.000Z",
      },
      {
        id: "o1-placed",
        type: "order_placed",
        message: "Order pickora-1 placed",
        detail: "buyer@example.com",
        timestamp: "2026-09-01T10:00:00.000Z",
      },
    ]);
  });

  it("includes recently listed products as product_listed events, newest first overall", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () =>
              Promise.resolve({
                data: [
                  { id: "p1", name: "ThinkPad X1", brand: "Lenovo", created_at: "2026-09-05T00:00:00.000Z" },
                ],
                error: null,
              }),
          }),
        }),
      }),
    });
    const { fetchActivityFeed } = await import("./admin-data");

    const events = await fetchActivityFeed();
    expect(events).toEqual([
      {
        id: "product-p1",
        type: "product_listed",
        message: "Lenovo ThinkPad X1 listed",
        detail: null,
        timestamp: "2026-09-05T00:00:00.000Z",
      },
    ]);
  });

  it("throws AdminDataError when the product query errors", async () => {
    getSupabaseAdminClientMock.mockReturnValue(null);
    getSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: "boom" } }),
          }),
        }),
      }),
    });
    const { fetchActivityFeed, AdminDataError } = await import("./admin-data");

    await expect(fetchActivityFeed()).rejects.toBeInstanceOf(AdminDataError);
  });
});
