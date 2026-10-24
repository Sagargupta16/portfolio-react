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
// source of truth at /portfolio-react/data/<name>.json. contact.json is the one
// file left out of /data/. It is not secret: src/data/contact.ts bundles it into
// the app, and the EmailJS IDs in it are public by design.
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
   ["rss.xml", "application/rss+xml; charset=utf-8"],
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

// Preload the two faces first paint needs: Yellowtail signs the intro splash
// name and Bricolage sets the hero headline. Without this the latin files are
// found only once the CSS has parsed and the text is laid out. The hrefs are
// the hashed assets the fontsource CSS already points at, so nothing loads
// twice. Build only: dev serves the fonts unhashed and needs no hint.
const PRELOAD_FONTS = [
   "yellowtail-latin-400-normal.woff2",
   "bricolage-grotesque-latin-opsz-normal.woff2",
];
function preloadFonts() {
   let base = "/";
   return {
      name: "preload-fonts",
      apply: "build",
      configResolved(resolved) {
         base = resolved.base;
      },
      transformIndexHtml(_html, { bundle = {} }) {
         const assets = Object.values(bundle).filter(
            (output) => output.type === "asset",
         );
         return PRELOAD_FONTS.map((name) => {
            const asset = assets.find((output) => output.names.includes(name));
            if (!asset) {
               throw new Error(`preload-fonts: ${name} is not in the bundle`);
            }
            return {
               tag: "link",
               attrs: {
                  rel: "preload",
                  as: "font",
                  type: "font/woff2",
                  href: base + asset.fileName,
                  crossorigin: true,
               },
               injectTo: "head",
            };
         });
      },
   };
}

// Content Security Policy as a meta tag, since GitHub Pages cannot send
// headers. Every runtime origin is listed: the two analytics scripts and their
// beacons, Credly badge images, the EmailJS API and the GitHub contributions
// API. Build only: the dev server's React Refresh preamble is an inline script.
const CSP = [
   "default-src 'self'",
   "script-src 'self' https://scripts.simpleanalyticscdn.com https://www.googletagmanager.com",
   "style-src 'self' 'unsafe-inline'",
   "img-src 'self' data: https://images.credly.com https://queue.simpleanalyticscdn.com https://*.google-analytics.com https://*.googletagmanager.com",
   "font-src 'self'",
   "connect-src 'self' https://api.emailjs.com https://github-contributions-api.jogruber.de https://queue.simpleanalyticscdn.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
   "object-src 'none'",
   "base-uri 'self'",
   "form-action 'self'",
].join("; ");
function contentSecurityPolicy() {
   return {
      name: "content-security-policy",
      apply: "build",
      transformIndexHtml: () => [
         {
            tag: "meta",
            attrs: { "http-equiv": "Content-Security-Policy", content: CSP },
            injectTo: "head-prepend",
         },
      ],
   };
}

export default defineConfig(() => ({
   plugins: [
      tailwindcss(),
      react(),
      publishData(),
      machineView(),
      preloadFonts(),
      contentSecurityPolicy(),
   ],
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
      cssCodeSplit: true,
      rollupOptions: {
         output: {
            // Function form -- Vite 8's Rolldown bundler dropped object-form
            // manualChunks. Group heavy vendors into stable cacheable chunks.
            // Icons are left out on purpose: each icon lands with the chunk
            // that imports it, so the entry carries only the handful the
            // first screen draws and the skill registry's glyphs stay in its
            // lazy chunk.
            manualChunks(id) {
               if (!id.includes("node_modules")) return;
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
