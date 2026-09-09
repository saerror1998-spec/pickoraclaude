import { Header } from "@/components/Header";
import { CatalogSection } from "@/components/CatalogSection";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";

export const metadata = {
  title: "Shop all laptops — Pickora",
};

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
