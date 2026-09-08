import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { AddToCartButton } from "@/components/AddToCartButton";
import { fetchProductBySlug, formatPrice, ProductFetchError } from "@/lib/products";

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

  const savePercent =
    product.originalPriceCents && product.originalPriceCents > product.priceCents
      ? Math.round((1 - product.priceCents / product.originalPriceCents) * 100)
      : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-desktop)] lg:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-cream-warm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1051px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            {savePercent !== null && (
              <span className="absolute left-4 top-4 rounded-[var(--radius-pill)] bg-[var(--color-save)] px-3 py-1 text-xs font-medium text-white">
                Save {savePercent}%
              </span>
            )}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.1em] text-taupe">{product.brand}</p>
            <h1 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ink">
              {product.name}
            </h1>
            <p className="mt-3 text-base text-taupe">
              {product.specText || `${product.processor} · ${product.ramGb}GB · ${product.storageGb}GB`}
            </p>

            <div className="mt-6 flex items-center gap-3 tabular-nums">
              <span className="text-2xl text-ink">{formatPrice(product.priceCents)}</span>
              {product.originalPriceCents && (
                <span className="text-lg text-taupe-light line-through">
                  {formatPrice(product.originalPriceCents)}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-taupe">
              Condition: {product.condition} · {product.inStock ? "In stock" : "Sold out"}
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
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
