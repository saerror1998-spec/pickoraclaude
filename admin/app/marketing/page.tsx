import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { CustomersTable } from "@/components/CustomersTable";
import { NotConnectedCard } from "@/components/NotConnectedCard";
import { DashboardError } from "@/components/DashboardError";
import { fetchAdminCustomers, AdminDataError } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

export default async function MarketingPage() {
  let customers;
  try {
    customers = await fetchAdminCustomers();
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

  const repeatCustomers = customers.filter((c) => c.paidOrderCount > 1).length;
  const totalSpentCents = customers.reduce((sum, c) => sum + c.totalSpentCents, 0);
  const topCustomers = [...customers].sort((a, b) => b.totalSpentCents - a.totalSpentCents).slice(0, 10);

  return (
    <>
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-6 lg:grid-cols-3">
        <StatCard
          stat={{
            label: "Email audience",
            value: customers.length.toLocaleString("en-US"),
            deltaLabel: "Customers with an email on file",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Repeat customers",
            value: repeatCustomers.toLocaleString("en-US"),
            deltaLabel: "More than one paid order",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Lifetime value",
            value: formatPrice(totalSpentCents),
            deltaLabel: "Total spend across all customers",
            trend: "flat",
          }}
        />

        <NotConnectedCard
          title="Campaign tools aren't connected yet"
          description="Pickora doesn't have an email or ads platform (e.g. Klaviyo, Meta Ads) wired up, so open rates, click-throughs, and spend can't be shown here honestly. The audience below is real — customers who've reached Nomod checkout."
        />

        <div className="col-span-full">
          <div className="mb-3 text-sm text-text-muted">Top customers by spend</div>
          <CustomersTable customers={topCustomers} />
        </div>
      </main>
    </>
  );
}
