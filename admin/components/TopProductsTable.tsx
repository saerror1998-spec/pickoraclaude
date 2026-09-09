import { Card } from "./Card";
import { formatPrice } from "@/lib/format";
import type { TopProduct } from "@/lib/types";

export function TopProductsTable({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <Card className="text-center text-text-muted">
        No paid orders yet — best sellers will show up here once someone completes checkout.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-card-border text-text-faint">
            <th className="px-5 py-3 font-normal">Product</th>
            <th className="px-5 py-3 text-right font-normal">Units sold</th>
            <th className="px-5 py-3 text-right font-normal">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId} className="border-b border-card-border/60 last:border-0">
              <td className="px-5 py-3 text-text">{product.name}</td>
              <td className="px-5 py-3 text-right tabular-nums text-text-muted">{product.unitsSold}</td>
              <td className="px-5 py-3 text-right tabular-nums text-text">{formatPrice(product.revenueCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
