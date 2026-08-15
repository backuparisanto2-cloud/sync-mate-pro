/**
 * Konfigurasi khusus ekspor statis: build SPA murni tanpa SSR/nitro.
 * Dipakai oleh scripts/export-static.mjs (`npm run export:static`).
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const serverStub = path.resolve(rootDir, "static/server-stub.ts");

export default defineConfig({
  base: "./",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  resolve: {
    alias: [
      // Modul khusus backend tidak boleh masuk bundel browser.
      { find: /^.*\.server(\.tsx?)?$/, replacement: serverStub },
      { find: "@", replacement: path.resolve(rootDir, "src") },
    ],
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  build: {
    minify: false,
    sourcemap: true,
    outDir: "dist-static",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(rootDir, "index.static.html"),
    },
  },
});
