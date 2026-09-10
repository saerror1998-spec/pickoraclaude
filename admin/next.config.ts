import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Real product images live in Supabase Storage — without this,
      // next/image rejects every product photo with a 400 in production.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
