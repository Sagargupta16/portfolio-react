import { createRoot } from "react-dom/client";
import { MotionPreferenceProvider } from "@hooks/MotionPreferenceProvider";
import HairlineFigure from "./hairline/HairlineFigure";
import { FRAMES } from "./hairline";
import type { Frame, FigureModule } from "./hairline";

/*
 * Dev-only bench (served at /figure-lab.html by `vite`, never built): mounts
 * any figure module so a figure can be checked before it is wired into a
 * registry. Query: m=covers/diagram, surface=cover|banner|service, w=343,
 * tint=%2360a5fa, tour=0 to hold the tour.
 */

// A Map, so the module named in the URL can only ever be one of these files.
const modules = new Map(
   Object.entries(import.meta.glob<FigureModule>("./*/*.ts")),
);
const q = new URLSearchParams(location.search);
const path = `./${q.get("m") ?? "covers/diagram"}.ts`;
const surfaceKey = q.get("surface") ?? "cover";
const surface: Frame = Object.hasOwn(FRAMES, surfaceKey)
   ? FRAMES[surfaceKey as keyof typeof FRAMES]
   : FRAMES.hairline;
const width = Number(q.get("w") ?? 343);
const tint = q.get("tint") ?? "#60a5fa";

const lab = document.getElementById("lab");
const load = modules.get(path);
if (lab && !load) lab.textContent = `no module ${path}`;
if (lab && load) {
   const mod = await load();
   const frame: Frame = mod.frame ?? surface;
   createRoot(lab).render(
      <MotionPreferenceProvider>
         <div
            data-lab-slot=""
            style={{
               width,
               aspectRatio: `${frame[0]} / ${frame[1]}`,
               position: "relative",
               margin: 16,
               background: "#0c1216",
               borderRadius: 20,
               overflow: "hidden",
            }}
         >
            <HairlineFigure
               mount={mod.mount}
               tint={tint}
               tour={q.get("tour") === "0" ? undefined : mod.tour}
               frame={frame}
            />
         </div>
      </MotionPreferenceProvider>,
   );
}
