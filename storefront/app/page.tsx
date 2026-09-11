import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HomepageBuyersGuide } from "@/components/HomepageBuyersGuide";
import { BestOffers } from "@/components/BestOffers";
import { CategoryTiles } from "@/components/CategoryTiles";
import { PromoBanner } from "@/components/PromoBanner";
import { PromoBand } from "@/components/PromoBand";
import { BestLaptops } from "@/components/BestLaptops";
import { CTABanner } from "@/components/CTABanner";
import { MoreToExplore } from "@/components/MoreToExplore";
import { WhyPickora } from "@/components/WhyPickora";
import { Testimonials } from "@/components/Testimonials";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError, getSavePercent } from "@/lib/products";
import type { Product } from "@/lib/types";

// Without this, Next.js statically prerenders this page at build time (it
// has no explicit dynamic API usage for Next to detect), freezing prices,
// stock, and the homepage's featured deal as of the last deploy — real
// catalog changes wouldn't show up until the next rebuild.
export const dynamic = "force-dynamic";

/** The single product featured in the Hero's floating deal card — the biggest real discount among in-stock items. */
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
        <CategoryTiles products={products} />
        <BestOffers products={products} />
        <PromoBanner products={products} />
        <PromoBand products={products} />
        <BestLaptops products={products} />
        <CTABanner products={products} />
        <MoreToExplore products={products} />
        <HomepageBuyersGuide products={products} />
        <WhyPickora />
        <Testimonials />
      </main>
      <MobileDock />
    </>
  );
}
