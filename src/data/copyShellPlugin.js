import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizePath } from "vite";
import { slicePersonal, sliceSections, sliceUi } from "./copyShellSlices.ts";

/* Build-time source of the copy the first load needs. The entry chunk (App,
   the nav, the hero, the intro splash and the fixed controls) reads a few
   dozen fields of data/personal.json, ui.json and sections.json, but a JSON
   import always lands whole, so importing those files from the entry shipped
   the copy of every lazy section with the first screen too. This plugin runs
   the slices in copyShellSlices.ts over the three files and serves only those
   fields as virtual:copy-shell; the lazy sections still import the full files
   through @data/personal, @data/ui and @data/sections.

   generateBundle guards it: the build fails if any of the three full files is
   back in a chunk the first load fetches (the entry and the chunks it
   statically imports).

   Registered in vite.config.js; read through @data/copyShell. */

const MODULE_ID = "virtual:copy-shell";
const RESOLVED_ID = `\0${MODULE_ID}`;
const SLICES = {
   personal: slicePersonal,
   ui: sliceUi,
   sections: sliceSections,
};
const FULL_FILE = new RegExp(
   String.raw`[\\/]data[\\/](${Object.keys(SLICES).join("|")})\.json$`,
);

/** The entry chunks and every chunk they import statically. */
const firstLoadChunks = (bundle) => {
   const chunks = new Map();
   const visit = (chunk) => {
      if (chunk?.type !== "chunk" || chunks.has(chunk.fileName)) return;
      chunks.set(chunk.fileName, chunk);
      for (const name of chunk.imports) visit(bundle[name]);
   };
   for (const output of Object.values(bundle)) {
      if (output.type === "chunk" && output.isEntry) visit(output);
   }
   return [...chunks.values()];
};

export default function copyShell() {
   let dataDir = "";
   const fileOf = (name) => join(dataDir, `${name}.json`);
   return {
      name: "copy-shell",
      configResolved(config) {
         dataDir = join(config.root, "data");
      },
      resolveId(id) {
         if (id === MODULE_ID) return RESOLVED_ID;
      },
      load(id) {
         if (id !== RESOLVED_ID) return;
         return Object.entries(SLICES)
            .map(([name, slice]) => {
               this.addWatchFile(fileOf(name));
               const data = slice(
                  JSON.parse(readFileSync(fileOf(name), "utf8")),
               );
               return `export const ${name} = ${JSON.stringify(data)};`;
            })
            .join("\n");
      },
      generateBundle(_options, bundle) {
         for (const chunk of firstLoadChunks(bundle)) {
            const full = chunk.moduleIds.filter((id) => FULL_FILE.test(id));
            if (full.length === 0) continue;
            const files = full.map((id) => id.match(FULL_FILE)[1]).join(", ");
            this.error(
               `copy-shell: the first-load chunk ${chunk.fileName} carries the full ${files} copy. Modules in the entry read @data/copyShell, not @data/personal, @data/ui or @data/sections.`,
            );
         }
      },
      // Dev server: a data edit rebuilds the copy without a restart.
      configureServer(server) {
         const files = Object.keys(SLICES).map((name) =>
            normalizePath(fileOf(name)),
         );
         server.watcher.on("change", (changed) => {
            if (!files.includes(normalizePath(changed))) return;
            const node = server.moduleGraph.getModuleById(RESOLVED_ID);
            if (!node) return;
            server.moduleGraph.invalidateModule(node);
            server.ws.send({ type: "full-reload" });
         });
      },
   };
}
