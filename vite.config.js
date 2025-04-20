import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "brotliCompress", // o gzip
      ext: ".br", // extensión generada
      threshold: 1024, // mínimo tamaño de archivo a comprimir
    }),
  ],
  build: {
    target: "esnext", // Para navegadores modernos
    minify: "esbuild", // Ya viene por defecto, pero lo aclaramos
    sourcemap: false, // Desactiva sourcemaps para builds finales
    cssCodeSplit: true, // Divide el CSS para evitar bundles enormes
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
