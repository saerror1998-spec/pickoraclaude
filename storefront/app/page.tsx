import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HomepageBuyersGuide } from "@/components/HomepageBuyersGuide";
import { BestOffers } from "@/components/BestOffers";
import { ShopByBrand } from "@/components/ShopByBrand";
import { BestLaptops } from "@/components/BestLaptops";
import { WhyPickora } from "@/components/WhyPickora";
import { Testimonials } from "@/components/Testimonials";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";

// Without this, Next.js statically prerenders this page at build time (it
// has no explicit dynamic API usage for Next to detect), freezing prices,
// stock, and the homepage's featured deal as of the last deploy — real
// catalog changes wouldn't show up until the next rebuild.
export const dynamic = "force-dynamic";

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
        <Hero
          productCount={products.length}
          brandCount={new Set(products.map((p) => p.brand)).size}
        />
        <BestOffers products={products} />
        <ShopByBrand products={products} />
        <BestLaptops products={products} />
        <HomepageBuyersGuide products={products} />
        <WhyPickora />
        <Testimonials />
      </main>
      <MobileDock />
    </>
  );
}
