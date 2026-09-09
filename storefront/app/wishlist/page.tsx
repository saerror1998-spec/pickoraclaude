"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { useWishlist } from "@/components/WishlistProvider";
import { formatPrice } from "@/lib/products";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)]">
          <h1 className="type-label-md text-ink">Your wishlist</h1>

          {items.length === 0 ? (
            <div className="mt-8 rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
              <p className="text-taupe">Your wishlist is empty.</p>
              <Link
                href="/shop"
                className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
              >
                Browse laptops
              </Link>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 md:gap-[var(--gutter-desktop)]">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="relative rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-soft)]"
                >
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-taupe shadow-[var(--shadow-soft)] transition-colors hover:text-ink"
                  >
                    ×
                  </button>

                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[calc(var(--radius-card)-10px)] bg-cream-warm">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1051px) 33vw, (min-width: 761px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <h3 className="text-base text-ink">{item.name}</h3>
                      <p className="mt-2 tabular-nums text-base text-ink">{formatPrice(item.priceCents)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <MobileDock />
    </>
  );
}
