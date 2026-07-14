import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(() => ({
   plugins: [tailwindcss(), react()],
   base: "/portfolio-react/",
   resolve: {
      alias: {
         "@": fileURLToPath(new URL("./src", import.meta.url)),
         "@components": fileURLToPath(
            new URL("./src/components", import.meta.url),
         ),
         "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
         "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
         "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
         "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
         "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      },
   },
   server: {
      port: 3000,
      open: true,
   },
   build: {
      outDir: "build",
      sourcemap: "hidden",
      target: "esnext",
      minify: "esbuild",
      cssCodeSplit: true,
      rollupOptions: {
         output: {
            // Function form -- Vite 8's Rolldown bundler dropped object-form
            // manualChunks. Group heavy vendors into stable cacheable chunks.
            manualChunks(id) {
               if (!id.includes("node_modules")) return;
               if (id.includes("react-icons") || id.includes("lucide-react"))
                  return "icons";
               if (id.includes("/motion/") || id.includes("framer-motion"))
                  return "animations";
               if (id.includes("/react/") || id.includes("/react-dom/"))
                  return "vendor";
            },
         },
      },
      chunkSizeWarningLimit: 1000,
   },
   test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/__tests__/setup.ts"],
   },
}));
