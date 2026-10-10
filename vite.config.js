import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
   copyFileSync,
   mkdirSync,
   readdirSync,
   readFileSync,
   writeFileSync,
} from "node:fs";
import { buildMachineFiles } from "./scripts/machine-view.js";

const pkg = JSON.parse(
   readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

// Publish data/*.json as static files (build/data/), so other tools can read the same
// source of truth at /portfolio-react/data/<name>.json. contact.json stays private.
const PRIVATE_DATA = new Set(["contact.json"]);
function publishData() {
   return {
      name: "publish-data",
      apply: "build",
      closeBundle() {
         const src = new URL("./data/", import.meta.url);
         const out = new URL("./build/data/", import.meta.url);
         mkdirSync(out, { recursive: true });
         for (const file of readdirSync(src)) {
            if (file.endsWith(".json") && !PRIVATE_DATA.has(file)) {
               copyFileSync(new URL(file, src), new URL(file, out));
            }
         }
      },
   };
}

// Machine view (llms.txt, index.md, vCard) generated from data/*.json. Written
// into build/ on build; in dev, served fresh per request so data edits show live.
const MACHINE_TYPES = new Map([
   ["llms.txt", "text/plain; charset=utf-8"],
   ["index.md", "text/markdown; charset=utf-8"],
   ["sagar-gupta.vcf", "text/vcard; charset=utf-8"],
]);
function machineView() {
   const root = fileURLToPath(new URL(".", import.meta.url));
   let config;
   return {
      name: "machine-view",
      configResolved(resolved) {
         config = resolved;
      },
      closeBundle() {
         if (config.command !== "build") return;
         const out = resolve(config.root, config.build.outDir);
         for (const [file, body] of buildMachineFiles(root)) {
            writeFileSync(resolve(out, file), body);
         }
      },
      configureServer(server) {
         // Registered directly (not a returned post hook) so it runs before
         // the SPA fallback rewrites these paths to index.html.
         server.middlewares.use((req, res, next) => {
            const path = req.url?.split("?")[0] ?? "";
            const file = path.slice(config.base.length);
            if (!path.startsWith(config.base) || !MACHINE_TYPES.has(file)) {
               return next();
            }
            res.setHeader("Content-Type", MACHINE_TYPES.get(file));
            res.end(buildMachineFiles(root).get(file));
         });
      },
   };
}

export default defineConfig(() => ({
   plugins: [tailwindcss(), react(), publishData(), machineView()],
   base: "/portfolio-react/",
   // Build stamp shown in the footer status bar.
   define: {
      "import.meta.env.APP_VERSION": JSON.stringify(pkg.version),
      "import.meta.env.BUILD_DATE": JSON.stringify(
         new Date().toISOString().slice(0, 10),
      ),
   },
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
      sourcemap: false,
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
