import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { StorageBucketList } from "@/components/StorageBucketList";
import { DashboardError } from "@/components/DashboardError";
import { fetchStorageOverview, AdminDataError } from "@/lib/admin-data";
import { formatBytes } from "@/lib/format";

export default async function StoragePage() {
  let storage;
  try {
    storage = await fetchStorageOverview();
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
            label: "Total files",
            value: storage.totalFileCount.toLocaleString("en-US"),
            deltaLabel: `Across ${storage.buckets.length} bucket${storage.buckets.length === 1 ? "" : "s"}`,
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Total size",
            value: formatBytes(storage.totalSizeBytes),
            deltaLabel: "Live from Supabase Storage",
            trend: "flat",
          }}
        />
        <StatCard
          stat={{
            label: "Buckets",
            value: storage.buckets.length.toLocaleString("en-US"),
            deltaLabel: "Public and private",
            trend: "flat",
          }}
        />

        <StorageBucketList buckets={storage.buckets} />
      </main>
    </>
  );
}
