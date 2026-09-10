import type { MetadataRoute } from "next";

const SITE_URL = "https://pickoraonline.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/cart", "/wishlist", "/checkout", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
