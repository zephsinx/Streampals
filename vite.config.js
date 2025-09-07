import { defineConfig } from "vite";

export default defineConfig({
  base: "/Streampals/",
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name].[hash].js",
        entryFileNames: "js/[name].[hash].js",
      },
    },
  },
  publicDir: "public",
});
