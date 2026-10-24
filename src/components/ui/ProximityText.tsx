import { useEffect, useRef } from "react";
import { cancelFrame, frame } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import { segments } from "@utils/accentSegments";

/* Variable-font proximity: each letter's weight swells as the pointer nears
   it (Bricolage's wght axis), falling off over `radius` px. The *accent*
   word stays in the serif and is not varied. Fine pointers only (touch has no
   hover position); off in Reduced motion. One passive listener, at most one
   pass per frame, and the loop idles while the pointer is far from the line.
   Each pass reads every letter centre before it writes any weight, in
   Motion's read and render steps, so a weight change never forces a
   synchronous layout for the next letter or for Motion's own reads. */

interface Token {
   at: number;
   text: string;
   space: boolean;
   chars: { at: number; text: string }[];
}

/** Words and whitespace runs with their string offsets (stable keys); words
    are kept whole (nowrap) and split into letters for the weight effect. */
const tokens = (text: string, base: number): Token[] =>
   [...text.matchAll(/\S+|\s+/g)].map((match) => {
      const at = base + match.index;
      const space = /^\s/.test(match[0]);
      const chars: Token["chars"] = [];
      let offset = at;
      for (const ch of match[0]) {
         chars.push({ at: offset, text: ch });
         offset += ch.length;
      }
      return { at, text: match[0], space, chars };
   });

interface ProximityTextProps {
   text: string;
   from?: number;
   to?: number;
   radius?: number;
}

const ProximityText = ({
   text,
   from = 600,
   to = 800,
   radius = 150,
}: ProximityTextProps) => {
   const ref = useRef<HTMLSpanElement>(null);
   const { reducedMotion } = useMotionPreference();
   const parts = segments(text);
   const plain = parts.map((part) => part.text).join("");

   useEffect(() => {
      const root = ref.current;
      const fine = globalThis.matchMedia?.("(pointer: fine)").matches;
      if (!root || reducedMotion || !fine) return;
      const letters = [...root.querySelectorAll<HTMLElement>("[data-prox]")];
      let resting = true;
      let pointer = { x: 0, y: 0 };
      let weights: number[] = [];

      const settle = () => {
         for (const el of letters) el.style.fontVariationSettings = "";
      };
      const apply = () => {
         letters.forEach((el, i) => {
            el.style.fontVariationSettings = `"wght" ${weights[i]}`;
         });
      };
      const measure = () => {
         const box = root.getBoundingClientRect();
         const near =
            pointer.x > box.left - radius &&
            pointer.x < box.right + radius &&
            pointer.y > box.top - radius &&
            pointer.y < box.bottom + radius;
         if (!near) {
            if (!resting) {
               resting = true;
               frame.render(settle);
            }
            return;
         }
         resting = false;
         weights = letters.map((el) => {
            const r = el.getBoundingClientRect();
            const d = Math.hypot(
               pointer.x - (r.left + r.width / 2),
               pointer.y - (r.top + r.height / 2),
            );
            const t = Math.max(0, 1 - d / radius);
            return Math.round(from + (to - from) * t * t);
         });
         frame.render(apply);
      };
      // A step queues each callback once, so moves within a frame coalesce.
      const onMove = (event: PointerEvent) => {
         pointer = { x: event.clientX, y: event.clientY };
         frame.read(measure);
      };
      globalThis.addEventListener("pointermove", onMove, { passive: true });
      return () => {
         globalThis.removeEventListener("pointermove", onMove);
         cancelFrame(measure);
         cancelFrame(apply);
         cancelFrame(settle);
         settle();
      };
   }, [reducedMotion, from, to, radius]);

   return (
      <span ref={ref} style={{ fontWeight: from }}>
         <span className="sr-only">{plain}</span>
         <span aria-hidden="true">
            {parts.map(({ at, text: part, accent }) =>
               accent ? (
                  <em key={at} className="accent-serif">
                     {part}
                  </em>
               ) : (
                  <span key={at}>
                     {tokens(part, at).map((token) =>
                        token.space ? (
                           token.text
                        ) : (
                           <span
                              key={token.at}
                              style={{ whiteSpace: "nowrap" }}
                           >
                              {token.chars.map((ch) => (
                                 <span key={ch.at} data-prox="">
                                    {ch.text}
                                 </span>
                              ))}
                           </span>
                        ),
                     )}
                  </span>
               ),
            )}
         </span>
      </span>
   );
};

export default ProximityText;
