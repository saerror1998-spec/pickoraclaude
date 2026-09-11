import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { ProductCard } from "@/components/ProductCard";
import { ProductLoadError } from "@/components/ProductLoadError";
import { fetchProducts, paginate, ProductFetchError } from "@/lib/products";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const TITLE = "Laptops Under 500 AED | Refurbished & Renewed | Pickora";
const DESCRIPTION =
  "Shop refurbished laptops under 500 AED in the UAE — Dell & HP Chromebooks, inspected and backed by a 90-day warranty. Free shipping across the UAE.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/laptops-under-500-aed" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const PRICE_CEILING_CENTS = 50000;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are laptops under 500 AED reliable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "From Pickora, yes — every laptop at this price point still goes through the same 4-step certification and ships with the same 90-day warranty as anything else in the catalog. What changes at this price is the spec: expect older processors, lower RAM, and Chromebooks more often than Windows machines, since that's what genuinely exists at this price point.",
      },
    },
  ],
};

export default async function LaptopsUnder500Page({ searchParams }: PageProps<"/laptops-under-500-aed">) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1);

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

  const budgetProducts = products.filter((p) => p.inStock && p.priceCents <= PRICE_CEILING_CENTS);
  const chromebookCount = budgetProducts.filter((p) => p.compatibility.includes("ChromeOS")).length;
  const windowsCount = budgetProducts.filter((p) => p.compatibility.includes("Windows")).length;
  const { items: pageProducts, totalPages } = paginate(budgetProducts, page);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <h1 className="type-headline-md text-ink">Laptops Under 500 AED</h1>
          <p className="mt-4 max-w-2xl text-taupe">
            At this price point, expect older processors and modest RAM — mostly Chromebooks, with the
            occasional Windows machine when an older-generation unit is graded and priced to match.
            Every laptop here still ships with the same 90-day warranty and certification as the rest of
            the catalog.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h2 className="type-label-md text-ink">What can you actually get for under 500 AED?</h2>
              <p className="mt-3 text-sm text-taupe">
                Right now that&apos;s {budgetProducts.length} real in-stock laptops — light,
                everyday-use machines: web browsing, documents, email, streaming. Not machines for heavy
                multitasking or demanding software.
              </p>
            </div>
            <div>
              <h2 className="type-label-md text-ink">Chromebook vs. Windows laptop under 500 AED</h2>
              <p className="mt-3 text-sm text-taupe">
                {chromebookCount > 0 && windowsCount > 0
                  ? `Currently ${chromebookCount} Chromebook${chromebookCount === 1 ? "" : "s"} and ${windowsCount} Windows laptop${windowsCount === 1 ? "" : "s"} are in stock at this price. Chromebooks run ChromeOS — fast to boot, low-maintenance, best for browser-based work. The Windows options here are older-generation business laptops, renewed and re-certified rather than brand-new.`
                  : "Selection at this exact price point shifts as stock moves — check the grid below for what's currently available."}
              </p>
            </div>
          </div>

          {budgetProducts.length === 0 ? (
            <div className="mt-10 rounded-[var(--radius-card)] bg-white p-12 text-center text-taupe shadow-[var(--shadow-soft)]">
              Nothing&apos;s in stock under 500 AED right now — check{" "}
              <Link href="/shop" className="underline underline-offset-2">
                the full catalog
              </Link>{" "}
              for the next price tier up.
            </div>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-[var(--gutter-mobile)] sm:grid-cols-2 lg:grid-cols-3 md:gap-[var(--gutter-desktop)]">
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} buildHref={(p) => `/laptops-under-500-aed?page=${p}`} />
            </>
          )}

          <div className="mt-14">
            <details className="group rounded-[var(--radius-card-secondary)] bg-white p-5 shadow-[var(--shadow-soft)] open:pb-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base text-ink marker:content-none">
                Are laptops under 500 AED reliable?
                <span
                  aria-hidden
                  className="shrink-0 text-taupe-light transition-transform duration-200 ease-[var(--ease-expo-out)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-taupe">
                From Pickora, yes — every laptop at this price point still goes through the same 4-step
                certification and ships with the same 90-day warranty as anything else in the catalog.
                What changes at this price is the spec, not the reliability of the unit you receive.
              </p>
            </details>
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
