import { Card } from "./Card";

export function DashboardError() {
  return (
    <Card className="col-span-full text-center">
      <h2 className="text-lg text-text">We couldn&apos;t load dashboard data</h2>
      <p className="mt-2 text-sm text-text-muted">
        Something went wrong reaching Supabase. Please refresh the page, or check back shortly.
      </p>
    </Card>
  );
}
