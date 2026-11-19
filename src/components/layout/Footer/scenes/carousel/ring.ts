/* The ring on the floor: one hairline ellipse, the front half a little
   stronger than the back half so it reads as lying flat, and a short tick
   across the line at every mark. It is the scene's only drawing; it is built
   once per layout and never animates. */

const SVG = "http://www.w3.org/2000/svg";
const PAD = 8;
const TICK = 3.5;

/** A mark on the floor: px from the ring's centre (y up) and its depth
    (-1 the back of the ring, 1 the front). */
export interface RingMark {
   x: number;
   y: number;
   d: number;
}

export const createRing = (): SVGSVGElement => {
   const svg = document.createElementNS(SVG, "svg");
   svg.setAttribute("class", "cr-ring");
   svg.setAttribute("aria-hidden", "true");
   svg.setAttribute("focusable", "false");
   return svg;
};

const el = <K extends keyof SVGElementTagNameMap>(
   name: K,
   cls: string,
   attrs: Record<string, string>,
): SVGElementTagNameMap[K] => {
   const node = document.createElementNS(SVG, name);
   node.setAttribute("class", cls);
   for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
   return node;
};

/** Sizes and places the ring for radii rx, ry with its centre `floor` px
    above the stage's bottom edge, and draws a tick at every mark. */
export const drawRing = (
   svg: SVGSVGElement,
   rx: number,
   ry: number,
   floor: number,
   marks: readonly RingMark[],
): void => {
   const w = Math.ceil(rx * 2 + PAD * 2);
   const h = Math.ceil(ry * 2 + PAD * 2);
   const cx = w / 2;
   const cy = h / 2;
   svg.style.left = `calc(50% - ${cx}px)`;
   svg.style.bottom = `${floor - cy}px`;
   svg.setAttribute("width", String(w));
   svg.setAttribute("height", String(h));
   svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
   const arc = (sweep: 0 | 1): string =>
      `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 ${sweep} ${cx + rx} ${cy}`;
   const parts: SVGElement[] = [
      el("path", "cr-ring-back", { d: arc(1) }),
      el("path", "cr-ring-front", { d: arc(0) }),
   ];
   // along the ring's normal at the mark
   for (const m of marks) {
      const px = cx + m.x;
      const py = cy - m.y;
      let nx = m.x / (rx * rx);
      let ny = -m.y / (ry * ry);
      const len = Math.hypot(nx, ny) || 1;
      nx = (nx / len) * TICK;
      ny = (ny / len) * TICK;
      parts.push(
         el("line", m.d >= 0 ? "cr-tick-front" : "cr-tick-back", {
            x1: (px - nx).toFixed(1),
            y1: (py - ny).toFixed(1),
            x2: (px + nx).toFixed(1),
            y2: (py + ny).toFixed(1),
         }),
      );
   }
   svg.replaceChildren(...parts);
};
