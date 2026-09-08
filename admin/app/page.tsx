import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { OrdersTrendChart } from "@/components/OrdersTrendChart";
import { RevenueChart } from "@/components/RevenueChart";
import { FunnelCard } from "@/components/FunnelCard";
import { TrafficPieChart } from "@/components/TrafficPieChart";
import { DashboardError } from "@/components/DashboardError";
import { fetchDashboardOverview, AdminDataError } from "@/lib/admin-data";

export default async function OverviewPage() {
  let overview;
  try {
    overview = await fetchDashboardOverview();
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
        <StatCard stat={overview.stats.orders} />
        <StatCard stat={overview.stats.averageOrderValueCents} />
        <StatCard stat={overview.stats.conversionRate} />

        <OrdersTrendChart data={overview.ordersTrend} totalViews="72K" />
        <RevenueChart data={overview.revenueByMonth} highlightMonth={overview.revenueHighlightMonth} />

        <FunnelCard stages={overview.funnel} />
        <div className="lg:col-span-2">
          <TrafficPieChart sources={overview.trafficSources} totalOrders={overview.totalOrdersLast30Days} />
        </div>
      </main>
    </>
  );
}
