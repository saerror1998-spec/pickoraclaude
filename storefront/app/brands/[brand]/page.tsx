import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { ProductCard } from "@/components/ProductCard";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";
import { brandMeta, brandSlug } from "@/lib/brand-meta";

export const dynamic = "force-dynamic";

const KNOWN_BRAND_SLUGS = ["dell", "hp", "lenovo", "elite"];

export function generateStaticParams() {
  return KNOWN_BRAND_SLUGS.map((brand) => ({ brand }));
}

async function resolveBrand(slug: string) {
  const products = await fetchProducts();
  const realBrand = products.find((p) => brandSlug(p.brand) === slug)?.brand ?? null;
  return { products, realBrand };
}

export async function generateMetadata({ params }: PageProps<"/brands/[brand]">): Promise<Metadata> {
  const { brand: slug } = await params;
  const { realBrand } = await resolveBrand(slug).catch(() => ({ realBrand: null }));
  if (!realBrand) return { title: "Brand not found | Pickora" };

  const { title, description } = brandMeta(realBrand);
  return { title, description };
}

export default async function BrandPage({ params }: PageProps<"/brands/[brand]">) {
  const { brand: slug } = await params;

  let products, realBrand;
  try {
    ({ products, realBrand } = await resolveBrand(slug));
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

  if (!realBrand) notFound();

  const { intro } = brandMeta(realBrand);
  const brandProducts = products.filter((p) => p.brand === realBrand);
  const inStockCount = brandProducts.filter((p) => p.inStock).length;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-taupe">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink">{realBrand}</span>
          </nav>

          <h1 className="type-headline-md text-ink">Refurbished {realBrand} Laptops in the UAE</h1>
          <p className="mt-4 max-w-2xl text-taupe">{intro}</p>
          <p className="mt-2 text-sm text-taupe-light">{inStockCount} laptops in stock now.</p>

          {brandProducts.length === 0 ? (
            <div className="mt-10 rounded-[var(--radius-card)] bg-white p-12 text-center text-taupe shadow-[var(--shadow-soft)]">
              Nothing from {realBrand} is in stock right now — check{" "}
              <Link href="/shop" className="underline underline-offset-2">
                the full catalog
              </Link>
              .
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-[var(--gutter-desktop)]">
              {brandProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileDock />
    </>
  );
}
