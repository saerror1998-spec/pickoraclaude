"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { CheckoutButton } from "@/components/CheckoutButton";
import { PaymentBadges } from "@/components/PaymentBadges";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { items, subtotalCents, removeItem, setQuantity } = useCart();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)]">
          <h1 className="text-2xl text-ink">Your cart</h1>

          {items.length === 0 ? (
            <div className="mt-8 rounded-[var(--radius-card)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
              <p className="text-taupe">Your cart is empty.</p>
              <Link
                href="/shop"
                className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
              >
                Browse laptops
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center gap-4 rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-soft)]"
                  >
                    <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-card-secondary)] bg-cream-warm">
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.slug}`} className="block truncate text-sm text-ink hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 tabular-nums text-sm text-taupe">{formatPrice(item.priceCents)}</p>
                    </div>

                    <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                      Quantity for {item.name}
                    </label>
                    <select
                      id={`qty-${item.productId}`}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                      className="rounded-[var(--radius-pill)] border border-taupe-light/40 bg-white px-3 py-1.5 text-sm text-ink focus-visible:outline-none"
                    >
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="rounded-full p-2 text-taupe-light transition-colors hover:text-red-600"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <div className="h-fit rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between text-sm text-taupe">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal" className="tabular-nums text-ink">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-taupe-light">Shipping and taxes calculated at checkout.</p>

                <div className="mt-6">
                  <CheckoutButton
                    lineItems={items.map((item) => ({
                      productId: item.productId,
                      name: item.name,
                      priceCents: item.priceCents,
                      quantity: item.quantity,
                    }))}
                  />
                </div>

                <div className="mt-4">
                  <PaymentBadges />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileDock />
    </>
  );
}
