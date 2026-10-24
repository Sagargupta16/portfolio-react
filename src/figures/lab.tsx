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

const modules = import.meta.glob<FigureModule>("./*/*.ts");
const q = new URLSearchParams(location.search);
const path = `./${q.get("m") ?? "covers/diagram"}.ts`;
const surface = (q.get("surface") ?? "cover") as keyof typeof FRAMES;
const width = Number(q.get("w") ?? 343);
const tint = q.get("tint") ?? "#60a5fa";

async function main() {
   const load = modules[path];
   const lab = document.getElementById("lab");
   if (!lab) return;
   if (!load) {
      lab.textContent = `no module ${path}`;
      return;
   }
   const mod = await load();
   const frame: Frame = mod.frame ?? FRAMES[surface] ?? FRAMES.hairline;
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

void main();
