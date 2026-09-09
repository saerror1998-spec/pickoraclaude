import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/products";

const SITE_URL = "https://store.pickoraonline.com";

const STATIC_ROUTES = ["", "/shop", "/warranty", "/support"];

/** Real sitemap: every static route plus every real product slug from Supabase. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    productEntries = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(),
    }));
  } catch {
    // Sitemap generation shouldn't 500 the whole route if Supabase is briefly
    // unavailable — ship the static routes and let the next build pick up
    // the product URLs.
  }

  return [...staticEntries, ...productEntries];
}
