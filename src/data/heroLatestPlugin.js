import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizePath } from "vite";
import { hasProjectUrl, parseProjectDate } from "../utils/projectMetadata.ts";
import { listProjects } from "./projectLists.ts";

/* Build-time source of the hero's LATEST line. The line needs two facts, the
   newest merged upstream PR and the newest project with a live link, and both
   come out of data/projects.json, the biggest chunk the site loads. Deriving
   them here, when Vite builds, lets the hero ship a few dozen bytes instead of
   that chunk (the Projects section still loads it when it nears the
   viewport). The picking rules are the ones HeroLatest used to run in the
   browser; the project order and the date parsing come from the same helpers
   the Projects section uses, so the two cannot disagree.

   Registered in vite.config.js; read through @data/heroLatest. */

const MODULE_ID = "virtual:hero-latest";
const RESOLVED_ID = `\0${MODULE_ID}`;

/** The hero's two links, as plain data. Null where nothing qualifies. */
const deriveHeroLatest = (file) => {
   const pr = (file.open_source_contributions ?? [])
      .filter((c) => c.status === "merged" && c.merged_at)
      .sort((a, b) => (b.merged_at ?? "").localeCompare(a.merged_at ?? ""))[0];

   const project = listProjects(file)
      .filter((p) => hasProjectUrl(p.live))
      .sort(
         (a, b) =>
            parseProjectDate(b.date).getTime() -
            parseProjectDate(a.date).getTime(),
      )[0];

   return {
      pr: pr
         ? {
              repo: pr.repo.split("/")[1],
              number: pr.url.split("/").pop(),
              url: pr.url,
           }
         : null,
      project: project ? { title: project.title, live: project.live } : null,
   };
};

export default function heroLatest() {
   let projectsFile = "";
   return {
      name: "hero-latest",
      configResolved(config) {
         projectsFile = join(config.root, "data", "projects.json");
      },
      resolveId(id) {
         if (id === MODULE_ID) return RESOLVED_ID;
      },
      load(id) {
         if (id !== RESOLVED_ID) return;
         this.addWatchFile(projectsFile);
         const data = deriveHeroLatest(
            JSON.parse(readFileSync(projectsFile, "utf8")),
         );
         return `export default ${JSON.stringify(data)};`;
      },
      // Dev server: a data edit rebuilds the line without a restart.
      configureServer(server) {
         server.watcher.on("change", (changed) => {
            if (normalizePath(changed) !== normalizePath(projectsFile)) return;
            const node = server.moduleGraph.getModuleById(RESOLVED_ID);
            if (!node) return;
            server.moduleGraph.invalidateModule(node);
            server.ws.send({ type: "full-reload" });
         });
      },
   };
}
