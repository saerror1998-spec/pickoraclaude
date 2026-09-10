import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Real product images live in Supabase Storage (see
      // scripts/import-products.mjs) — without this, next/image rejects
      // every product photo with a 400 in production.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Google account avatars, shown in the header once a customer signs
      // in with Google.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
