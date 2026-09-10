import Image from "next/image";
import Link from "next/link";
import { brandSlug } from "@/lib/brand-meta";
import { ShowAllToggle } from "./ShowAllToggle";
import type { Product } from "@/lib/types";

const UNDER_500_CEILING_CENTS = 50000;
const MAX_BRAND_TILES = 4;

// Soft tinted backgrounds cycling per tile — Pickora's own accent colors at
// low opacity, not the reference's fruity greens/pinks (brief: keep the
// current palette, borrow only the tile pattern).
const TINTS = ["bg-glass-violet/[0.07]", "bg-glass-emerald/[0.08]", "bg-amber-500/[0.08]", "bg-zinc-500/[0.07]"];

type Tile = { label: string; count?: number; image: string; href: string };

function cheapestInStockImage(products: Product[]): string | undefined {
  const inStock = products.filter((p) => p.inStock);
  const pool = inStock.length > 0 ? inStock : products;
  return [...pool].sort((a, b) => a.priceCents - b.priceCents)[0]?.image;
}

export function CategoryTiles({ products }: { products: Product[] }) {
  const byBrand = new Map<string, Product[]>();
  for (const product of products) {
    const list = byBrand.get(product.brand);
    if (list) list.push(product);
    else byBrand.set(product.brand, [product]);
  }

  const brandTiles: Tile[] = Array.from(byBrand.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_BRAND_TILES)
    .map(([brand, list]): Tile | null => {
      const image = cheapestInStockImage(list);
      if (!image) return null;
      return { label: brand, count: list.length, image, href: `/brands/${brandSlug(brand)}` };
    })
    .filter((t): t is Tile => t !== null);

  const under500 = products.filter((p) => p.inStock && p.priceCents <= UNDER_500_CEILING_CENTS);
  const under500Image = cheapestInStockImage(under500);

  const tiles: Tile[] = [
    ...brandTiles,
    ...(under500Image
      ? [{ label: "Under 500 AED", count: under500.length, image: under500Image, href: "/laptops-under-500-aed" }]
      : []),
  ];

  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-[var(--gutter-mobile)] pt-16 md:px-[var(--gutter-desktop)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass-muted">Shop by brand</p>
          <h2 className="mt-2 text-[clamp(1.5rem,2.5vw,2rem)] font-medium tracking-[-0.02em] text-glass-zinc">
            Browse the catalog
          </h2>
        </div>
        <ShowAllToggle href="/shop" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile, i) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={`group flex flex-col overflow-hidden rounded-2xl ${TINTS[i % TINTS.length]} p-4 transition-transform duration-300 ease-[var(--ease-glass)] hover:-translate-y-1`}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/60">
              <Image
                src={tile.image}
                alt={tile.label}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-contain p-3 transition-transform duration-300 ease-[var(--ease-glass)] group-hover:scale-105"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-glass-zinc">{tile.label}</p>
            {typeof tile.count === "number" && (
              <p className="text-xs text-glass-muted">
                {tile.count} laptop{tile.count === 1 ? "" : "s"}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
