import { Header } from "@/components/Header";
import { KpiCard } from "@/components/KpiCard";
import { InsightCard } from "@/components/InsightCard";
import { OrdersTable } from "@/components/OrdersTable";
import { OrdersTrendChart } from "@/components/OrdersTrendChart";
import { RevenueChart } from "@/components/RevenueChart";
import { DashboardError } from "@/components/DashboardError";
import { OrdersIcon, SalesIcon, CheckCircleIcon, PlusCircleIcon, ClockIcon, XCircleIcon, RefundIcon, BoxIcon, CustomersIcon } from "@/components/icons";
import { fetchDashboardOverview, AdminDataError } from "@/lib/admin-data";
import Link from "next/link";

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
      <main className="flex-1 space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard stat={overview.stats.revenue30d} icon={<SalesIcon width={18} height={18} />} index={0} />
          <KpiCard stat={overview.stats.orders30d} icon={<OrdersIcon width={18} height={18} />} index={1} />
          <KpiCard stat={overview.stats.paidOrders30d} icon={<CheckCircleIcon width={18} height={18} />} index={2} />
          <KpiCard stat={overview.stats.newOrdersToday} icon={<PlusCircleIcon width={18} height={18} />} index={3} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-text-muted">Insights &amp; Performance</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <InsightCard insight={overview.insights.pendingOrders} icon={<ClockIcon width={16} height={16} />} index={0} barColor="warning" />
            <InsightCard insight={overview.insights.cancelledOrders} icon={<XCircleIcon width={16} height={16} />} index={1} />
            <InsightCard insight={overview.insights.refundedOrders} icon={<RefundIcon width={16} height={16} />} index={2} />
            <InsightCard insight={overview.insights.outOfStockProducts} icon={<BoxIcon width={16} height={16} />} index={3} barColor="warning" />
            <InsightCard insight={overview.insights.newCustomers30d} icon={<CustomersIcon width={16} height={16} />} index={4} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <OrdersTrendChart data={overview.ordersTrend} />
          <RevenueChart data={overview.revenueByMonth} />
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-muted">Recent orders</h2>
            <Link href="/orders" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <OrdersTable orders={overview.recentOrders} />
        </section>
      </main>
    </>
  );
}
