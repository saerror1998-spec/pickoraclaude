import { Card } from "./Card";
import type { IntegrationStatus } from "@/lib/types";

const STATUS_STYLES: Record<IntegrationStatus["status"], string> = {
  connected: "bg-positive/10 text-positive",
  not_configured: "bg-negative/10 text-negative",
  external: "bg-text-faint/10 text-text-faint",
};

const STATUS_LABELS: Record<IntegrationStatus["status"], string> = {
  connected: "Connected",
  not_configured: "Not configured",
  external: "Configured elsewhere",
};

export function IntegrationCard({ integration }: { integration: IntegrationStatus }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-text">{integration.name}</span>
        <span
          className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs ${STATUS_STYLES[integration.status]}`}
        >
          {STATUS_LABELS[integration.status]}
        </span>
      </div>
      <p className="text-sm text-text-muted">{integration.description}</p>
      <p className="text-xs text-text-faint">{integration.detail}</p>
    </Card>
  );
}
