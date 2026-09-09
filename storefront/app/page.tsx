import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BestOffers } from "@/components/BestOffers";
import { ShopByBrand } from "@/components/ShopByBrand";
import { BestLaptops } from "@/components/BestLaptops";
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

  const heroImages = products
    .filter((p) => p.inStock)
    .slice(0, 4)
    .map((p) => p.image);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero images={heroImages} />
        <BestOffers products={products} />
        <ShopByBrand products={products} />
        <BestLaptops products={products} />
        <WhyPickora />
      </main>
      <MobileDock />
    </>
  );
}
