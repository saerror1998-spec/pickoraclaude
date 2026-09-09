import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { CatalogBreakdownCard } from "@/components/CatalogBreakdownCard";
import { NotConnectedCard } from "@/components/NotConnectedCard";
import { DashboardError } from "@/components/DashboardError";
import { fetchCatalogComposition, AdminDataError } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

export default async function AnalyticsPage() {
  let catalog;
  try {
    catalog = await fetchCatalogComposition();
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
            label: "Catalog size",
            value: catalog.totalProducts.toLocaleString("en-US"),
            deltaLabel: "Products in Supabase",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "In stock",
            value: catalog.inStockCount.toLocaleString("en-US"),
            deltaLabel: `${catalog.soldOutCount.toLocaleString("en-US")} sold out`,
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Average price",
            value: formatPrice(catalog.averagePriceCents),
            deltaLabel: "Across the whole catalog",
            trend: "flat",
          }}
        />

        <CatalogBreakdownCard
          title="Catalog by condition"
          items={catalog.byCondition.map((c) => ({ label: c.condition, count: c.count }))}
        />
        <CatalogBreakdownCard
          title="Top brands by listing count"
          items={catalog.byBrand.map((b) => ({ label: b.brand, count: b.count }))}
        />

        <NotConnectedCard
          title="Traffic and conversion analytics aren't connected yet"
          description="Pickora doesn't have a web analytics provider (e.g. Google Analytics or Search Console) wired up, so visits, sessions, and funnel conversion can't be shown here honestly. The catalog breakdown above is real Supabase data in the meantime."
        />
      </main>
    </>
  );
}
