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

  it("computes real 30-day stats from real orders, comparing against the prior 30-day period", async () => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY_MS).toISOString();

    const orderRows = [
      // Last 30 days: one paid ($100), one pending (doesn't count toward revenue).
      { ...ORDER_ROW_A, id: "a", status: "paid", total_cents: 10000, created_at: iso(5) },
      { ...ORDER_ROW_A, id: "c", status: "pending", total_cents: 5000, created_at: iso(2) },
      // Prior 30-day period (31-60 days ago): one paid ($200).
      { ...ORDER_ROW_A, id: "b", status: "paid", total_cents: 20000, created_at: iso(40) },
    ];

    getSupabaseAdminClientMock.mockReturnValue({
      from: (table: string) => {
        expect(table).toBe("orders");
        return {
          select: (_columns: string, opts?: { head?: boolean }) => {
            if (opts?.head) return Promise.resolve({ error: null });
            return { order: () => Promise.resolve({ data: orderRows, error: null }) };
          },
        };
      },
    });
    const { fetchDashboardOverview } = await import("./admin-data");

    const overview = await fetchDashboardOverview();

    // 2 orders in the last 30 days vs 1 in the prior 30 days -> +100%.
    expect(overview.stats.orders30d.value).toBe("2");
    expect(overview.stats.orders30d.trend).toBe("up");
    expect(overview.totalOrdersLast30Days).toBe(2);

    // $100 paid revenue in the last 30 days vs $200 prior -> -50%.
    expect(overview.stats.revenue30d.value).toBe("$100");
    expect(overview.stats.revenue30d.trend).toBe("down");

    expect(overview.ordersTrend).toHaveLength(30);
    expect(overview.ordersTrend.reduce((sum, p) => sum + p.value, 0)).toBe(2);

    expect(overview.revenueByMonth).toHaveLength(6);
    expect(overview.revenueByMonth.reduce((sum, p) => sum + p.revenueCents, 0)).toBe(30000);

    // 1 paid order in the last 30 days vs 1 prior -> flat.
    expect(overview.stats.paidOrders30d.value).toBe("1");
    expect(overview.stats.paidOrders30d.trend).toBe("flat");

    // 1 pending order in the last 30 days, out of 2 orders total.
    expect(overview.insights.pendingOrders.value).toBe(1);
    expect(overview.insights.pendingOrders.total).toBe(2);
    expect(overview.insights.cancelledOrders.value).toBe(0);
    expect(overview.insights.refundedOrders.value).toBe(0);

    // No products table data mocked here, so catalog composition is empty.
    expect(overview.insights.outOfStockProducts).toEqual({
      label: "Out of stock",
      value: 0,
      total: 1,
      deltaLabel: "Live count",
      trend: "flat",
    });
  });

  it("computes newOrdersToday against yesterday, and detects genuinely new customers by first-ever order", async () => {
    const HOUR_MS = 60 * 60 * 1000;
    const iso = (hoursAgo: number) => new Date(Date.now() - hoursAgo * HOUR_MS).toISOString();

    const orderRows = [
      // Today: 2 new orders, one from a brand-new customer, one a repeat buyer.
      { ...ORDER_ROW_A, id: "new-1", customer_email: "new@example.com", created_at: iso(2) },
      { ...ORDER_ROW_A, id: "new-2", customer_email: "repeat@example.com", created_at: iso(5) },
      // Yesterday: 1 order.
      { ...ORDER_ROW_A, id: "yesterday-1", customer_email: "someone@example.com", created_at: iso(30) },
      // 40 days ago: the repeat buyer's actual first order (outside the 30d window).
      { ...ORDER_ROW_A, id: "old-1", customer_email: "repeat@example.com", created_at: iso(40 * 24) },
    ];

    getSupabaseAdminClientMock.mockReturnValue({
      from: (table: string) => {
        expect(table).toBe("orders");
        return {
          select: (_columns: string, opts?: { head?: boolean }) => {
            if (opts?.head) return Promise.resolve({ error: null });
            return { order: () => Promise.resolve({ data: orderRows, error: null }) };
          },
        };
      },
    });
    const { fetchDashboardOverview } = await import("./admin-data");

    const overview = await fetchDashboardOverview();

    expect(overview.stats.newOrdersToday.value).toBe("2");
    expect(overview.stats.newOrdersToday.trend).toBe("up");

    // "new@example.com" and "someone@example.com" both have their first-ever
    // order inside the last 30 days; "repeat@example.com"'s first order was
    // 40 days ago, so it doesn't count even though it ordered again today.
    expect(overview.insights.newCustomers30d.value).toBe(2);
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
