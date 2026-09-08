import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CatalogSection } from "@/components/CatalogSection";
import { WhyPickora } from "@/components/WhyPickora";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";

export default async function HomePage() {
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
        <CatalogSection products={products} />
        <WhyPickora />
      </main>
      <MobileDock />
    </>
  );
}
