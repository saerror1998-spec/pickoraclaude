import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BestOffers } from "@/components/BestOffers";
import { ShopByBrand } from "@/components/ShopByBrand";
import { BestLaptops } from "@/components/BestLaptops";
import { WhyPickora } from "@/components/WhyPickora";
import { Testimonials } from "@/components/Testimonials";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError, getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

/** The single product featured in the Hero — the biggest real discount among in-stock items. */
function pickHeroProduct(products: Product[]): Product | undefined {
  const inStock = products.filter((p) => p.inStock);
  const bestDiscount = [...inStock]
    .filter((p) => getSavePercent(p) !== null)
    .sort((a, b) => (getSavePercent(b) ?? 0) - (getSavePercent(a) ?? 0))[0];
  return bestDiscount ?? inStock[0];
}

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
            <Testimonials />
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
        <Hero product={pickHeroProduct(products)} />
        <BestOffers products={products} />
        <ShopByBrand products={products} />
        <BestLaptops products={products} />
        <WhyPickora />
        <Testimonials />
      </main>
      <MobileDock />
    </>
  );
}
