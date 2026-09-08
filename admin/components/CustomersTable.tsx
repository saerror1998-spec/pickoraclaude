import { Card } from "./Card";
import { formatPrice, formatDate } from "@/lib/format";
import type { AdminCustomer } from "@/lib/types";

export function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  if (customers.length === 0) {
    return (
      <Card className="text-center text-text-muted">
        No customers yet. Anyone who reaches Nomod checkout (even without completing payment) will
        show up here.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-card-border text-text-faint">
            <th className="px-5 py-3 font-normal">Customer</th>
            <th className="px-5 py-3 text-right font-normal">Orders</th>
            <th className="px-5 py-3 text-right font-normal">Paid</th>
            <th className="px-5 py-3 text-right font-normal">Total spent</th>
            <th className="px-5 py-3 text-right font-normal">Last order</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.email} className="border-b border-card-border/60 last:border-0">
              <td className="px-5 py-3">
                <div className="text-text">{customer.name || customer.email}</div>
                {customer.name && <div className="text-xs text-text-faint">{customer.email}</div>}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-text-muted">{customer.orderCount}</td>
              <td className="px-5 py-3 text-right tabular-nums text-text-muted">{customer.paidOrderCount}</td>
              <td className="px-5 py-3 text-right tabular-nums text-text">
                {formatPrice(customer.totalSpentCents)}
              </td>
              <td className="px-5 py-3 text-right text-text-faint">{formatDate(customer.lastOrderAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
