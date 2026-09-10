import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProductInfoAccordion } from "@/components/ProductInfoAccordion";
import { fetchProductBySlug, formatPrice, getSavePercent, ProductFetchError } from "@/lib/products";
import type { Product } from "@/lib/types";

const TRUST_BADGES = [
  { icon: "↩", label: "90-day warranty" },
  { icon: "⚡", label: "Free shipping" },
  { icon: "$", label: "Price match" },
] as const;

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Laptop not found | Pickora" };

  const savePercent = getSavePercent(product);
  const title = `${product.name} (${product.storageGb}GB/${product.ramGb}GB) – Refurbished | Pickora`;
  const description = `Buy the ${product.name} refurbished — ${product.condition}, ${product.ramGb}GB/${product.storageGb}GB, ${product.processor}. 90-day warranty, free UAE shipping. ${formatPrice(product.priceCents)}${savePercent !== null ? ` (save ${savePercent}%)` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, images: [product.image] },
  };
}

function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.sku,
    description: product.specText || `${product.processor}, ${product.ramGb}GB RAM, ${product.storageGb}GB storage`,
    offers: {
      "@type": "Offer",
      priceCurrency: process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://pickoraonline.com/products/${product.slug}`,
    },
    itemCondition: "https://schema.org/RefurbishedCondition",
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;

  let product;
  try {
    product = await fetchProductBySlug(slug);
  } catch (error) {
    if (error instanceof ProductFetchError) {
      console.error(error.message, error.cause);
      return (
        <>
          <Header />
          <main className="flex-1">
            <ProductLoadError />
          </main>
          <MobileDock />
        </>
      );
    }
    throw error;
  }

  if (!product) notFound();

  const savePercent = getSavePercent(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-[var(--gutter-mobile)] py-8 md:px-[var(--gutter-desktop)]">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-taupe">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/shop" className="transition-colors hover:text-ink">
              Laptops
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="group relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1051px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-[var(--ease-expo-out)] group-hover:scale-[1.03]"
                priority
              />
              {savePercent !== null && (
                <span className="absolute left-4 top-4 rounded-[var(--radius-pill)] bg-[var(--color-save)] px-3 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-soft)]">
                  Save {savePercent}%
                </span>
              )}
              {!product.inStock && (
                <span className="absolute right-4 top-4 rounded-[var(--radius-pill)] bg-ink/85 px-3 py-1.5 text-xs font-medium text-white">
                  Sold out
                </span>
              )}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-taupe">{product.brand}</p>

              <ScrollReveal
                as="h1"
                lines={[product.name]}
                className="mt-2 text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.1] tracking-tight text-ink"
                immediate
              />

              <p className="mt-4 text-base text-taupe">
                {product.specText || `${product.processor} · ${product.ramGb}GB · ${product.storageGb}GB`}
              </p>

              <div className="mt-6 flex items-baseline gap-3 tabular-nums">
                <span className="text-3xl text-ink">{formatPrice(product.priceCents)}</span>
                {product.originalPriceCents && (
                  <span className="text-lg text-taupe-light line-through">
                    {formatPrice(product.originalPriceCents)}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-taupe">
                Condition:{" "}
                <span className="text-ink">{product.condition}</span>
                <span className="mx-2 text-taupe-light" aria-hidden>
                  ·
                </span>
                {product.inStock ? (
                  <span className="text-[var(--color-save)]">In stock</span>
                ) : (
                  <span className="text-taupe-light">Sold out</span>
                )}
              </p>

              <div className="mt-8 max-w-sm">
                {product.inStock ? (
                  <AddToCartButton
                    product={{
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      image: product.image,
                      priceCents: product.priceCents,
                    }}
                  />
                ) : (
                  <p className="text-sm text-taupe">This laptop is currently sold out.</p>
                )}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 border-t border-ink/8 pt-8 sm:grid-cols-3">
                {TRUST_BADGES.map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-3 rounded-[var(--radius-card-secondary)] bg-cream-warm px-4 py-3"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm text-ink"
                      aria-hidden
                    >
                      {badge.icon}
                    </span>
                    <span className="text-sm text-taupe">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ProductInfoAccordion product={product} />
        </div>
      </main>
      <MobileDock />
    </>
  );
}
