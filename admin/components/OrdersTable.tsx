import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { formatPrice, formatDateTime } from "@/lib/format";
import type { AdminOrder } from "@/lib/types";

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <Card className="text-center text-text-muted">
        No orders yet. They&apos;ll show up here as soon as someone checks out.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-card-border text-text-faint">
            <th className="px-5 py-3 font-normal">Reference</th>
            <th className="px-5 py-3 font-normal">Customer</th>
            <th className="px-5 py-3 font-normal">Items</th>
            <th className="px-5 py-3 text-right font-normal">Total</th>
            <th className="px-5 py-3 font-normal">Status</th>
            <th className="px-5 py-3 text-right font-normal">Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-card-border/60 last:border-0">
              <td className="px-5 py-3 font-mono text-xs text-text-muted">
                {order.referenceId ?? order.id.slice(0, 8)}
              </td>
              <td className="px-5 py-3 text-text">
                {order.customerName || order.customerEmail || (
                  <span className="text-text-faint">—</span>
                )}
              </td>
              <td className="px-5 py-3 text-text-muted">
                {order.lineItems.reduce((sum, item) => sum + item.quantity, 0)} item
                {order.lineItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-text">
                {formatPrice(order.totalCents, order.currency)}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-5 py-3 text-right text-text-faint">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
