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
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
  // Standalone output bundles a minimal server.js + only the node_modules
  // actually needed, so deployment (e.g. Hostinger's Node.js App hosting)
  // doesn't require running a full `npm install` on constrained hosting.
  output: "standalone",
};

export default nextConfig;
