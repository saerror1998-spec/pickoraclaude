import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CatalogSection } from "@/components/CatalogSection";
import { MobileDock } from "@/components/MobileDock";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, ProductFetchError } from "@/lib/products";

// Real per-brand titles for the brands with dedicated copy below; any other
// real catalog brand still gets a genuinely unique (if templated) title
// rather than falling back to the generic /shop one, which was the actual
// SEO bug — every brand filter sharing one title/meta.
const BRAND_META: Record<string, { title: string; description: string }> = {
  Dell: {
    title: "Refurbished Dell Laptops in the UAE | Latitude & Inspiron | Pickora",
    description:
      "Shop certified refurbished Dell laptops in the UAE — Latitude & Inspiron models from AED 550. Inspected, 90-day warranty, free UAE-wide shipping.",
  },
  HP: {
    title: "Refurbished HP Laptops UAE | Chromebooks & EliteBook | Pickora",
    description:
      "Certified refurbished HP laptops in the UAE, from Chromebooks to EliteBooks. Every unit inspected and backed by a 90-day Pickora warranty.",
  },
  Lenovo: {
    title: "Refurbished Lenovo Laptops UAE | ThinkPad & Chromebook | Pickora",
    description:
      "Shop refurbished Lenovo laptops in the UAE — ThinkPad and Chromebook models, inspected and warrantied for 90 days. Free shipping across the UAE.",
  },
  Elite: {
    title: "Refurbished Elite Business Laptops UAE | Pickora",
    description:
      "Certified refurbished Elite business laptops in the UAE — touchscreen 2-in-1 models with 11th Gen i5 CPUs, inspected and warrantied.",
  },
};

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

  const known = BRAND_META[brandName];
  if (known) return known;

  return {
    title: `Refurbished ${brandName} Laptops UAE | Pickora`,
    description: `Shop certified refurbished ${brandName} laptops in the UAE — inspected, cleaned, and backed by a 90-day Pickora warranty.`,
  };
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
