import { describe, expect, it } from "vitest";
import { FIGURES } from "@/figures/catalog";
import {
   FRAMES,
   __pointerOf,
   __stepFigures,
   mk,
   type Frame,
   type Readout,
} from "@/figures/hairline";

/* Rule 04: a figure styles through classes only. Geometry attributes are fine. */
const PAINT = /^(fill|stroke|opacity|style|filter|color)(-|$)/;
const MOUSE = { pointerType: "mouse" } as PointerEvent;
const POINT = /[ML](-?[\d.]+) (-?[\d.]+)/g;

// One manual clock for the whole file, started before any figure mounts.
let clock = 0;
__stepFigures(clock);
const advance = (ms: number) => __stepFigures((clock += ms));

function painted(svg: SVGSVGElement): string[] {
   const out: string[] = [];
   for (const el of svg.querySelectorAll("*")) {
      if (el.closest("defs")) continue; // a reflection's fade mask is the one sanctioned paint
      for (const a of el.getAttributeNames())
         if (PAINT.test(a)) out.push(`<${el.tagName} ${a}>`);
   }
   return out;
}

/** Rule 03: M/L path points and ellipse centres that leave the frame. */
function outside(svg: SVGSVGElement, [w, h]: Frame): number[][] {
   const pts: number[][] = [];
   for (const p of svg.querySelectorAll("path"))
      for (const m of (p.getAttribute("d") ?? "").matchAll(POINT))
         pts.push([Number(m[1]), Number(m[2])]);
   for (const e of svg.querySelectorAll("ellipse"))
      pts.push([Number(e.getAttribute("cx")), Number(e.getAttribute("cy"))]);
   return pts.filter(([x, y]) => x < 0 || x > w || y < 0 || y > h);
}

describe.each(Object.entries(FIGURES))("hairline figure %s", (_, figure) => {
   it("keeps the ten rules through its tour and leaves nothing behind", () => {
      const frame = figure.frame ?? FRAMES.hairline;
      const stage = document.createElement("div");
      document.body.append(stage);
      const svg = mk("svg", { viewBox: `0 0 ${frame[0]} ${frame[1]}` }, stage);
      const read: Readout = { textContent: null };

      // (a) mount; HairlineFigure treats an engine that writes nothing as rest
      const handle = figure.mount({ stage, svg, read, frame }, 0.5);
      read.textContent ??= "rest";
      advance(2000);

      const look = () => {
         // (b) rule 10: no words in the drawing
         expect(svg.querySelector("text")).toBeNull();
         // (c) rule 04: classes only
         expect(painted(svg)).toEqual([]);
         expect(outside(svg, frame)).toEqual([]);
         return {
            read: read.textContent,
            d: [...svg.querySelectorAll("path")]
               .map((p) => p.getAttribute("d") ?? "")
               .sort(),
         };
      };

      // (f) at rest
      const rest = look();
      expect(rest.read).toBe("rest");
      expect(rest.d.some((d) => d.length > 0)).toBe(true);
      const frames = [rest];

      // (d) the tour, through the stored handlers, 2000 ms after each stop
      const on = __pointerOf(stage);
      expect(on).toBeDefined();
      expect(figure.tour.length).toBeGreaterThanOrEqual(3);
      expect(figure.tour.length).toBeLessThanOrEqual(6);
      expect(figure.tour.at(-1)).toBeNull();
      for (const stop of figure.tour) {
         if (stop) on!.move(stop, MOUSE);
         else on!.leave(MOUSE);
         advance(2000);
         const shot = look();
         // (f) every stop answers; the closing null returns to rest
         if (stop) expect(shot.read).not.toBe("rest");
         else expect(shot.read).toBe("rest");
         frames.push(shot);
      }

      // (e) the drawing at rest and at every stop
      expect(frames).toMatchSnapshot();

      // (g) destroy leaves the svg empty and the stage unheard
      handle.destroy();
      expect(svg.childNodes).toHaveLength(0);
      expect(__pointerOf(stage)).toBeUndefined();
      stage.remove();
   });
});
