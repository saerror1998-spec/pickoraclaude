import { Card } from "./Card";
import { OrdersIcon, ProductsIcon, ActivityIcon } from "./icons";
import { formatDateTime } from "@/lib/format";
import type { ActivityEvent, ActivityEventType } from "@/lib/types";

const EVENT_ICON: Record<ActivityEventType, typeof OrdersIcon> = {
  order_placed: OrdersIcon,
  order_status_changed: ActivityIcon,
  product_listed: ProductsIcon,
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="col-span-full text-center text-text-muted">
        No activity yet. Orders and new product listings will show up here as they happen.
      </Card>
    );
  }

  return (
    <Card className="col-span-full p-0">
      <ul>
        {events.map((event, index) => {
          const Icon = EVENT_ICON[event.type];
          return (
            <li
              key={event.id}
              className={`flex items-start gap-4 px-5 py-4 ${
                index === events.length - 1 ? "" : "border-b border-card-border/60"
              }`}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted">
                <Icon width={16} height={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">{event.message}</p>
                {event.detail && <p className="mt-0.5 truncate text-xs text-text-faint">{event.detail}</p>}
              </div>
              <span className="shrink-0 text-xs text-text-faint">{formatDateTime(event.timestamp)}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
