// This file is ESM but loaded via CJS require() by Vite's default resolver;
// suppress the resulting (harmless) native-config-loader warning.
process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = "true";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
