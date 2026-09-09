import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { AccountOrder } from "@/lib/account-orders";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-green-600/10 text-green-700" },
  pending: { label: "Processing", className: "bg-amber-500/10 text-amber-700" },
  // Nomod's docs claim "created" for an unpaid session, but the live API
  // actually returns "enabled" — see storefront/README.md. Treated the same.
  created: { label: "Awaiting payment", className: "bg-amber-500/10 text-amber-700" },
  enabled: { label: "Awaiting payment", className: "bg-amber-500/10 text-amber-700" },
  cancelled: { label: "Cancelled", className: "bg-ink/10 text-taupe" },
  expired: { label: "Expired", className: "bg-ink/10 text-taupe" },
  failed: { label: "Failed", className: "bg-red-600/10 text-red-700" },
};

function statusBadge(status: string) {
  return STATUS_LABEL[status] ?? { label: status, className: "bg-ink/10 text-taupe" };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function AccountOrderList({ orders }: { orders: AccountOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
        <p className="text-taupe">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/#catalog"
          className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
        >
          Browse laptops
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const badge = statusBadge(order.status);
        return (
          <li key={order.id} className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-ink">
                  Order {order.referenceId ? `#${order.referenceId}` : order.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 text-xs text-taupe-light">{DATE_FORMAT.format(new Date(order.createdAt))}</p>
              </div>
              <span className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-1 border-t border-ink/5 pt-4">
              {order.lineItems.map((item, index) => (
                <li key={`${order.id}-${item.productId}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-taupe">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="tabular-nums text-ink">{formatPrice(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-4 text-sm">
              <span className="text-taupe">Total</span>
              <span className="tabular-nums text-ink">{formatPrice(order.totalCents)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
