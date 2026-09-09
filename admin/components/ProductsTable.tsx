import Image from "next/image";
import Link from "next/link";
import { Card } from "./Card";
import { formatPrice } from "@/lib/format";
import type { AdminProduct } from "@/lib/types";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  if (products.length === 0) {
    return (
      <Card className="text-center text-text-muted">
        No products yet. Add your first laptop to the catalog to see it here.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-card-border text-text-faint">
            <th className="px-5 py-3 font-normal">Name</th>
            <th className="px-5 py-3 font-normal">Brand</th>
            <th className="px-5 py-3 font-normal">Condition</th>
            <th className="px-5 py-3 text-right font-normal">Price</th>
            <th className="px-5 py-3 text-right font-normal">Status</th>
            <th className="px-5 py-3 text-right font-normal">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-card-border/60 last:border-0">
              <td className="px-5 py-3 text-text">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-card-sm)] bg-panel">
                    <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <span className="truncate">{product.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-text-muted">{product.brand}</td>
              <td className="px-5 py-3 text-text-muted">{product.condition}</td>
              <td className="px-5 py-3 text-right tabular-nums text-text">{formatPrice(product.priceCents)}</td>
              <td className="px-5 py-3 text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs ${
                    product.inStock ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {product.inStock ? "In stock" : "Sold out"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <Link href={`/products/${product.id}/edit`} className="text-sm text-accent hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
