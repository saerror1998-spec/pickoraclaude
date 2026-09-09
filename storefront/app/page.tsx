import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BestOffers } from "@/components/BestOffers";
import { ShopByBrand } from "@/components/ShopByBrand";
import { CatalogSection } from "@/components/CatalogSection";
import { WhyPickora } from "@/components/WhyPickora";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";

export default async function HomePage({ searchParams }: PageProps<"/">) {
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
            <Hero />
            <ProductLoadError />
            <WhyPickora />
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
        <Hero />
        <BestOffers products={products} />
        <ShopByBrand products={products} />
        <CatalogSection products={products} initialBrand={initialBrand} />
        <WhyPickora />
      </main>
      <MobileDock />
    </>
  );
}
