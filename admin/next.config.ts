import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Standalone output bundles a minimal server.js + only the node_modules
  // actually needed, so deployment (e.g. Hostinger's Node.js App hosting)
  // doesn't require running a full `npm install` on constrained hosting.
  output: "standalone",
};

export default nextConfig;
