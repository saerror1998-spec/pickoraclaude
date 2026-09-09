import { Card } from "./Card";
import { formatDateTime } from "@/lib/format";
import type { ActivityEvent, ActivityEventType } from "@/lib/types";

const TYPE_LABEL: Record<ActivityEventType, string> = {
  order_placed: "ORDER",
  order_status_changed: "STATUS",
  product_listed: "PRODUCT",
};

export function LogTable({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="col-span-full text-center text-text-muted">
        No log entries yet. Order and product-catalog events will appear here as they happen.
      </Card>
    );
  }

  return (
    <Card className="col-span-full overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-left font-mono text-xs">
        <thead>
          <tr className="border-b border-card-border text-text-faint">
            <th className="px-5 py-3 font-normal">Timestamp</th>
            <th className="px-5 py-3 font-normal">Type</th>
            <th className="px-5 py-3 font-normal">Message</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-card-border/60 last:border-0">
              <td className="whitespace-nowrap px-5 py-2.5 text-text-faint">{formatDateTime(event.timestamp)}</td>
              <td className="whitespace-nowrap px-5 py-2.5 text-text-muted">{TYPE_LABEL[event.type]}</td>
              <td className="px-5 py-2.5 text-text">
                {event.message}
                {event.detail && <span className="text-text-faint"> · {event.detail}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
