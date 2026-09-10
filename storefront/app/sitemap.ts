import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/products";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { brandSlug } from "@/lib/brand-meta";

const SITE_URL = "https://store.pickoraonline.com";

const STATIC_ROUTES = ["", "/shop", "/warranty", "/support", "/blog", "/laptops-under-500-aed"];

/** Real sitemap: every static route, every blog post, plus every real product slug from Supabase. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let brandEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    productEntries = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(),
    }));

    const realBrandSlugs = new Set(products.map((p) => brandSlug(p.brand)));
    brandEntries = Array.from(realBrandSlugs).map((slug) => ({
      url: `${SITE_URL}/brands/${slug}`,
      lastModified: new Date(),
    }));
  } catch {
    // Sitemap generation shouldn't 500 the whole route if Supabase is briefly
    // unavailable — ship the static routes and let the next build pick up
    // the product URLs.
  }

  return [...staticEntries, ...blogEntries, ...brandEntries, ...productEntries];
}
