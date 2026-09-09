import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { OrdersTrendChart } from "@/components/OrdersTrendChart";
import { RevenueChart } from "@/components/RevenueChart";
import { NotConnectedCard } from "@/components/NotConnectedCard";
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
        <StatCard stat={overview.stats.orders30d} />
        <StatCard stat={overview.stats.revenue30d} />
        <StatCard stat={overview.stats.averageOrderValue30d} />

        <OrdersTrendChart data={overview.ordersTrend} />
        <RevenueChart data={overview.revenueByMonth} />

        <NotConnectedCard
          title="Traffic and conversion analytics aren't connected yet"
          description="Pickora doesn't have a web analytics provider (e.g. Google Analytics or Search Console) wired up, so visits, sessions, and funnel conversion can't be shown here honestly. The stats and charts above are real order data in the meantime."
        />
      </main>
    </>
  );
}
