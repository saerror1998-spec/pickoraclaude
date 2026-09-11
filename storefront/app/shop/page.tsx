import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CatalogSection } from "@/components/CatalogSection";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, filterProducts, sortProducts, paginate, parseCatalogSearchParams, ProductFetchError } from "@/lib/products";
import { brandMeta, brandSlug } from "@/lib/brand-meta";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { brand } = await searchParams;
  const brandName = typeof brand === "string" ? brand : null;
  if (!brandName) {
    const title = "Shop All Refurbished Laptops | Dell, HP & Lenovo | Pickora";
    const description =
      "Browse Pickora's full catalog of certified refurbished laptops — Dell, HP & Lenovo from AED 525. Every unit inspected, cleaned and backed by a 90-day warranty.";
    return {
      title,
      description,
      alternates: { canonical: "/shop" },
      openGraph: { title, description },
    };
  }

  const { title, description } = brandMeta(brandName);
  return {
    title,
    description,
    // /shop?brand=X and /brands/[brand] render the same content for a given
    // brand — canonicalize the filtered query-param variant to the dedicated
    // brand page so Google consolidates ranking signal onto one URL instead
    // of splitting it across two near-duplicate pages.
    alternates: { canonical: `/brands/${brandSlug(brandName)}` },
    openGraph: { title, description },
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const resolvedSearchParams = await searchParams;

  let catalog;
  try {
    catalog = await fetchProducts();
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

  const { filters, sort, page } = parseCatalogSearchParams(resolvedSearchParams);
  const brands = Array.from(new Set(catalog.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));
  const filteredAndSorted = sortProducts(filterProducts(catalog, filters), sort);
  const { items, totalPages, totalCount } = paginate(filteredAndSorted, page);

  return (
    <>
      <Header />
      <main className="flex-1">
        <CatalogSection
          products={items}
          brands={brands}
          filters={filters}
          sort={sort}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </main>
      <MobileDock />
    </>
  );
}
