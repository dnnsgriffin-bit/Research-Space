/**
 * Static preview build of the product pages, for sharing as a single link.
 * Separate from the Lovable/TanStack Start build: run with
 *   npx vite build --config preview/vite.config.ts
 * It uses in-memory routing and relative asset paths so the output works
 * from any folder, with no server.
 */
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(__dirname, "..");

/** Public assets are referenced as "/demo/…" in the app; make them relative here. */
function relativeAssets(): Plugin {
  return {
    name: "preview-relative-assets",
    enforce: "pre",
    transform(code, id) {
      if (!id.startsWith(path.join(root, "src")) || !/\.(t|j)sx?$/.test(id)) return null;
      const out = code.replace(/(["'`])\/(demo|about|landing)\//g, "$1./$2/");
      return out === code ? null : { code: out, map: null };
    },
  };
}

export default defineConfig({
  root: __dirname,
  base: "./",
  publicDir: path.join(root, "public"),
  plugins: [relativeAssets(), react(), tailwindcss()],
  resolve: { alias: { "@": path.join(root, "src") } },
  build: {
    outDir: process.env.PREVIEW_OUT ?? path.join(root, ".preview-dist"),
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
