import { useEffect, useRef } from "react";
import useMotionPreference from "@hooks/useMotionPreference";
import { segments } from "@utils/accentSegments";

/* Variable-font proximity: each letter's weight swells as the pointer nears
   it (Bricolage's wght axis), falling off over `radius` px. The *accent*
   word stays in the serif and is not varied. Fine pointers only (touch has no
   hover position); off in Reduced motion. One passive listener, one rAF per
   move, and the loop idles while the pointer is far from the line. */

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
      let frame = 0;
      let resting = true;
      let pointer = { x: 0, y: 0 };

      const settle = () => {
         for (const el of letters) el.style.fontVariationSettings = "";
         resting = true;
      };
      const update = () => {
         frame = 0;
         const box = root.getBoundingClientRect();
         const near =
            pointer.x > box.left - radius &&
            pointer.x < box.right + radius &&
            pointer.y > box.top - radius &&
            pointer.y < box.bottom + radius;
         if (!near) {
            if (!resting) settle();
            return;
         }
         resting = false;
         for (const el of letters) {
            const r = el.getBoundingClientRect();
            const d = Math.hypot(
               pointer.x - (r.left + r.width / 2),
               pointer.y - (r.top + r.height / 2),
            );
            const t = Math.max(0, 1 - d / radius);
            el.style.fontVariationSettings = `"wght" ${Math.round(from + (to - from) * t * t)}`;
         }
      };
      const onMove = (event: PointerEvent) => {
         pointer = { x: event.clientX, y: event.clientY };
         if (!frame) frame = requestAnimationFrame(update);
      };
      globalThis.addEventListener("pointermove", onMove, { passive: true });
      return () => {
         globalThis.removeEventListener("pointermove", onMove);
         if (frame) cancelAnimationFrame(frame);
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
