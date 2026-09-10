import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CatalogSection } from "@/components/CatalogSection";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";
import { brandMeta } from "@/lib/brand-meta";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { brand } = await searchParams;
  const brandName = typeof brand === "string" ? brand : null;
  if (!brandName) {
    return {
      title: "Shop All Refurbished Laptops | Dell, HP & Lenovo | Pickora",
      description:
        "Browse Pickora's full catalog of certified refurbished laptops — Dell, HP & Lenovo from AED 525. Every unit inspected, cleaned and backed by a 90-day warranty.",
    };
  }

  const { title, description } = brandMeta(brandName);
  return { title, description };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const { brand } = await searchParams;
  const initialBrand = typeof brand === "string" ? brand : null;

  let products;
  try {
    products = await fetchProducts();
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

  return (
    <>
      <Header />
      <main className="flex-1">
        <CatalogSection products={products} initialBrand={initialBrand} />
      </main>
      <MobileDock />
    </>
  );
}
