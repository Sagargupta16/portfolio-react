/* The painted rooftop and its small life: a few window lights, three stars
   and a plane, all CSS loops on opacity and transform (rooftop.css). The
   loops hold while the scene is held (data-hold on the root) and stop in
   Reduced (data-still), as the lab draft's did. */

import paintLarge from "@assets/footer/scenes/rooftop-2560.avif";
import paintSmall from "@assets/footer/scenes/rooftop-1280.avif";
import type { Fit } from "./geometry";

interface Light {
   x: number;
   y: number;
   p: number;
   d: number;
}
interface Pane extends Light {
   w: number;
   h: number;
   off?: boolean;
}

// The width in px of rooftop-1280.avif.
const SMALL_PX = 1280;

// Window lights over lit windows of the painting, clear of where people
// stand and sit: x, y, w, h as fractions of the painting, p the period and
// d the start offset in s. "off" ones go dark for a while instead.
const WINDOWS: readonly Pane[] = [
   { x: 0.1656, y: 0.5005, w: 0.0063, h: 0.0253, p: 13, d: -2 },
   { x: 0.175, y: 0.5014, w: 0.007, h: 0.0244, p: 19, d: -11, off: true },
   { x: 0.2234, y: 0.4424, w: 0.0063, h: 0.0206, p: 11, d: -6 },
   { x: 0.5301, y: 0.4817, w: 0.0066, h: 0.0131, p: 16, d: -9 },
   { x: 0.8625, y: 0.3365, w: 0.0105, h: 0.0394, p: 12, d: -4 },
   { x: 0.9398, y: 0.4133, w: 0.0074, h: 0.0337, p: 15, d: -1 },
   { x: 0.952, y: 0.4142, w: 0.0043, h: 0.0328, p: 23, d: -15, off: true },
];
// Unmasked: they twinkle in the open sky between the towers.
const STARS: readonly Light[] = [
   { x: 0.36, y: 0.265, p: 4.2, d: -1 },
   { x: 0.405, y: 0.292, p: 5.6, d: -3 },
   { x: 0.672, y: 0.27, p: 3.6, d: -2 },
];

const el = <K extends keyof HTMLElementTagNameMap>(
   tag: K,
   className: string,
): HTMLElementTagNameMap[K] => {
   const node = document.createElement(tag);
   node.className = className;
   return node;
};

const light = (className: string, l: Light): HTMLElement => {
   const node = el("i", className);
   node.style.setProperty("--rt-x", String(l.x));
   node.style.setProperty("--rt-y", String(l.y));
   node.style.setProperty("--rt-p", `${l.p}s`);
   node.style.setProperty("--rt-d", `${l.d}s`);
   return node;
};

export interface Backdrop {
   /** Places the painting for the stage box (CSS custom properties only). */
   place(fit: Fit): void;
   /** Loads and decodes the painting for this fit, then shows it. */
   paint(fit: Fit): Promise<void>;
}

export function buildBackdrop(root: HTMLElement): Backdrop {
   const art = el("div", "rt-art");
   const paint = el("div", "rt-paint");
   for (const w of WINDOWS) {
      const node = light(w.off ? "rt-win rt-win-off" : "rt-win", w);
      node.style.setProperty("--rt-w", String(w.w));
      node.style.setProperty("--rt-h", String(w.h));
      paint.append(node);
   }
   paint.append(el("div", "rt-shade"));
   art.append(paint, ...STARS.map((s) => light("rt-star", s)));
   const flight = el("div", "rt-flight");
   flight.append(el("i", "rt-plane"));
   root.append(art, flight);

   // The Image stays referenced so its decoded bitmap stays cached for the
   // background that uses the same URL.
   const images = new Map<string, Promise<HTMLImageElement>>();
   let wanted = "";
   let shown = "";

   return {
      place(fit) {
         const s = root.style;
         s.setProperty("--rt-ih", `${fit.ih.toFixed(2)}px`);
         s.setProperty("--rt-top", `${fit.top.toFixed(2)}px`);
         s.setProperty("--rt-fade-from", `${(fit.fadeFrom * 100).toFixed(2)}%`);
         s.setProperty("--rt-fade-to", `${(fit.fadeTo * 100).toFixed(2)}%`);
         s.setProperty("--rt-flight", `${fit.flightTop.toFixed(1)}px`);
         s.setProperty("--rt-edge", `${fit.edge.toFixed(1)}px`);
         root.toggleAttribute("data-edge", fit.edge > 0.5);
      },
      paint(fit) {
         // The small file covers the painting where its drawn width times the
         // pixel ratio (capped at 2, a 15 percent upscale of line art does
         // not show) stays within 1280 px; phones always use it.
         const dpr = Math.min(window.devicePixelRatio || 1, 2);
         const src =
            fit.wide && fit.artWidth * dpr * 0.85 > SMALL_PX
               ? paintLarge
               : paintSmall;
         wanted = src;
         let loading = images.get(src);
         if (!loading) {
            const img = new Image();
            img.src = src;
            // A failed decode still shows what loaded; a failed load shows
            // the page colour, and the cast plays on.
            loading = img.decode().then(
               () => img,
               () => img,
            );
            images.set(src, loading);
         }
         return loading.then(() => {
            if (wanted !== src || shown === src) return;
            shown = src;
            paint.style.backgroundImage = `url("${src}")`;
         });
      },
   };
}
