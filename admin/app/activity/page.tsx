import { Header } from "@/components/Header";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { DashboardError } from "@/components/DashboardError";
import { fetchActivityFeed, AdminDataError } from "@/lib/admin-data";

export default async function ActivityPage() {
  let events;
  try {
    events = await fetchActivityFeed();
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
      <main className="grid flex-1 grid-cols-1 gap-3 p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg text-text">Activity</h2>
          <span className="text-sm text-text-muted">{events.length} recent events</span>
        </div>
        <ActivityTimeline events={events} />
      </main>
    </>
  );
}
