// next.config.ts uses `output: "standalone"` so Hostinger's Node.js App
// hosting can run this without a full `npm install`. Standalone mode does
// NOT include `public/` or `.next/static` in its own output — Next.js
// requires copying them in manually (see
// https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
// Skipping this step means the standalone server starts but can't serve
// its own static chunks or /public assets in production.
import { cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.error("copy-standalone-assets: .next/standalone not found — did `next build` run first?");
  process.exit(1);
}

cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });
cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), { recursive: true });

console.log("copy-standalone-assets: copied public/ and .next/static into .next/standalone/");
