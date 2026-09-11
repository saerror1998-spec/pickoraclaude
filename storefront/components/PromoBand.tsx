import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

// Only real, already-verified Pickora offers (matches the existing trust
// badges on the homepage) — the reference design's "10% off your first
// order" tile is dropped since no such offer actually exists in this store.
type PromoTile = { title: string; href: string; tint: string };

const PROMO_TILES: PromoTile[] = [
  { title: "Free shipping on every order", href: "/delivery", tint: "bg-glass-emerald/10" },
  { title: "0% APR with tabby & tamara", href: "/#why-pickora", tint: "bg-glass-violet/10" },
  { title: "Found it cheaper? We'll price match", href: "/#why-pickora", tint: "bg-amber-500/10" },
];

/** One real, distinct in-stock product photo per tile, so each tile shows a genuine laptop rather than a stock icon. */
function pickTileImages(products: Product[], count: number): string[] {
  const inStock = products.filter((p) => p.inStock);
  const pool = inStock.length > 0 ? inStock : products;
  const sorted = [...pool].sort((a, b) => a.priceCents - b.priceCents);
  const step = Math.max(1, Math.floor(sorted.length / count));
  return Array.from({ length: count }, (_, i) => sorted[Math.min(i * step, sorted.length - 1)]?.image).filter(
    (img): img is string => Boolean(img)
  );
}

export function PromoBand({ products }: { products: Product[] }) {
  const images = pickTileImages(products, PROMO_TILES.length);
  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-4 md:px-[var(--gutter-desktop)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PROMO_TILES.map((tile, i) => (
          <Link
            key={tile.title}
            href={tile.href}
            className={`group flex items-center gap-4 overflow-hidden rounded-2xl ${tile.tint} p-5 transition-transform duration-300 ease-[var(--ease-glass)] hover:-translate-y-1`}
          >
            {images[i] && (
              <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-white/60">
                <Image
                  src={images[i]}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <p className="text-sm font-medium text-glass-zinc">{tile.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
