/**
 * Adapted from hairline (https://github.com/lucasmarkes/hairline),
 * packages/hairline/src/core/styles.ts. MIT License.
 * Copyright (c) 2026 Lucas Marques. Full license in THIRD_PARTY_NOTICES.md.
 *
 * The stylesheet, and the one function that puts it in the document. Every
 * selector is inside `:where()`, so each rule has zero specificity and their
 * order decides; the order below is part of the design.
 *
 * The palette is the site's, dark only: the plate is the cover background,
 * the bright stroke is the slot's tint (`--hairline-hi`, set by
 * HairlineFigure), and edge, mid and lo are white alphas that read on the
 * near-black. `ok` and `warn` are the only other bright classes, for pass
 * and deny signals; they obey rule 04 like `hi`: one bright place at a time.
 */

import { MONO_FONT } from "@/constants/theme";

/** The plate: the cover background in ProjectCover.tsx. */
export const PLATE = "#0c1216";

const PALETTE = {
   plate: PLATE,
   hi: "#60a5fa",
   edge: "rgb(255 255 255 / 0.58)",
   mid: "rgb(255 255 255 / 0.32)",
   lo: "rgb(255 255 255 / 0.18)",
} as const;

const vars = Object.entries(PALETTE)
   .map(([k, v]) => `--hl-${k}:var(--hairline-${k},${v});`)
   .join("");
const EASE = "cubic-bezier(0.5,0,0.1,1)";
const SVG = ":where([data-hairline]>svg)";
const OK = "#22c55e";
const WARN = "#f59e0b";

/** The stylesheet. */
export const css = [
   // the box fills its slot; the 400 x 320 frame is centred in it by the svg's preserveAspectRatio
   `:where([data-hairline]){position:absolute;inset:0;display:block;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;--hl-sw:var(--hairline-stroke,0.9);${vars}background:var(--hairline-stage,var(--hl-plate))}`,
   `${SVG}{position:absolute;inset:0;width:100%;height:100%;display:block}`,
   // the read-out (rule 10): a corner caption outside the drawing
   `:where([data-hairline]>[data-hairline-read]){position:absolute;z-index:1;top:12px;left:14px;font-family:${MONO_FONT};font-size:9.5px;line-height:1;letter-spacing:0.08em;text-transform:uppercase;color:rgb(255 255 255 / 0.55);pointer-events:none;white-space:nowrap}`,
   // the drawing: plates are filled with the plate colour and painted back to front
   `${SVG} :where(path,polygon,ellipse,line){fill:var(--hl-plate);stroke:var(--hl-mid);stroke-width:var(--hl-sw);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;transition:stroke 260ms ${EASE}}`,
   `${SVG} :where(.nf){fill:none}`,
   `${SVG} :where(.fo){stroke:none}`,
   `${SVG} :where(.sil){stroke:var(--hl-edge)}`,
   `${SVG} :where(.hi){stroke:var(--hl-hi)}`,
   `${SVG} :where(.ok){stroke:${OK}}`,
   `${SVG} :where(.warn){stroke:${WARN}}`,
   `${SVG} :where(.lo){stroke:var(--hl-lo)}`,
   `${SVG} :where(.dash){stroke-dasharray:1 3}`,
   `${SVG} :where(.dot){stroke:none;fill:var(--hl-hi);transition:fill 260ms ${EASE}}`,
   `${SVG} :where(.dot.m){fill:var(--hl-edge)}`,
   `${SVG} :where(.dot.off){fill:var(--hl-lo)}`,
   `${SVG} :where(.dot.ok){fill:${OK}}`,
   `${SVG} :where(.dot.warn){fill:${WARN}}`,
   `${SVG} :where(.ghost path){fill:none;stroke:var(--hl-mid)}`,
].join("");

/** Puts the stylesheet in the document, once. */
export function inject(doc: Document = document): void {
   if (doc.querySelector("style[data-hairline-style]")) return;
   const style = doc.createElement("style");
   style.setAttribute("data-hairline-style", "");
   style.textContent = css;
   doc.head.appendChild(style);
}
