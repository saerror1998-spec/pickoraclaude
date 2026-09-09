import { Card } from "./Card";

/**
 * Honest placeholder for a section with no real data source wired up yet
 * (e.g. web analytics, email/ad campaigns) — used instead of fabricating
 * numbers that would look real but aren't. Distinct from DashboardError,
 * which is for a query that actually failed.
 */
export function NotConnectedCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="col-span-full text-center">
      <h2 className="text-lg text-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{description}</p>
    </Card>
  );
}
