import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { TopProductsTable } from "@/components/TopProductsTable";
import { OrdersTable } from "@/components/OrdersTable";
import { DashboardError } from "@/components/DashboardError";
import { fetchSalesOverview, AdminDataError } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

export default async function SalesPage() {
  let sales;
  try {
    sales = await fetchSalesOverview();
  } catch (error) {
    if (error instanceof AdminDataError) {
      console.error(error.message, error.cause);
      return (
        <>
          <Header />
          <main className="grid flex-1 grid-cols-1 gap-3 p-6">
            <DashboardError />
          </main>
        </>
      );
    }
    throw error;
  }

  return (
    <>
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-6 lg:grid-cols-3">
        <StatCard
          stat={{
            label: "Revenue",
            value: formatPrice(sales.totalRevenueCents),
            deltaLabel: "All-time, paid orders only",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Paid orders",
            value: sales.paidOrderCount.toLocaleString("en-US"),
            deltaLabel: "All-time",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Average order value",
            value: formatPrice(sales.averageOrderValueCents),
            deltaLabel: "Based on paid orders",
            trend: "flat",
          }}
        />

        <SalesTrendChart data={sales.revenueTrend} />

        <div className="col-span-full">
          <div className="mb-3 text-sm text-text-muted">Best sellers</div>
          <TopProductsTable products={sales.topProducts} />
        </div>

        <div className="col-span-full">
          <div className="mb-3 text-sm text-text-muted">Recent sales</div>
          <OrdersTable orders={sales.recentSales} />
        </div>
      </main>
    </>
  );
}
