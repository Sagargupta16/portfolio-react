import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ANNOTATIONS, type Annotation } from "@/constants/annotations";
import { EASING } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import { setAnnotationsOn } from "@utils/annotationsState";
import "./annotations.css";

/* Numbered pins over the live page, one per note in constants/annotations.
   Pins live in document coordinates (absolute, not fixed), so they ride the
   page with native and Lenis scrolling alike; they are re-measured when the
   page resizes or a deferred section mounts. Phones read the open note in a
   bottom card, desktop gets a card under the pin. */

interface Pin {
   note: Annotation;
   top: number;
   left: number;
}

const PIN_SIZE = 26;
const CARD_WIDTH = 300;
const EDGE = 12;

// Pin to the box the content actually fills: a centred h1 spans the full
// width, but its text does not, so the range rect hugs the letters.
const contentRect = (el: HTMLElement) => {
   const range = document.createRange();
   range.selectNodeContents(el);
   const rect = range.getBoundingClientRect();
   return rect.width > 0 && rect.height > 0 ? rect : el.getBoundingClientRect();
};

const firstVisible = (selector: string) => {
   for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = contentRect(el);
      if (rect.width > 0 && rect.height > 0) return rect;
   }
   return null;
};

const measurePins = (): Pin[] => {
   const pins: Pin[] = [];
   for (const note of ANNOTATIONS) {
      const rect = firstVisible(note.selector);
      if (!rect) continue;
      const left = Math.min(
         Math.max(rect.left + window.scrollX - PIN_SIZE / 2, EDGE),
         document.documentElement.clientWidth - PIN_SIZE - EDGE,
      );
      pins.push({
         note,
         top: Math.max(rect.top + window.scrollY - PIN_SIZE / 2, EDGE),
         left,
      });
   }
   return pins.sort((a, b) => a.top - b.top || a.left - b.left);
};

const AnnotationsLayer = () => {
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   const [pins, setPins] = useState<Pin[]>([]);
   const [openId, setOpenId] = useState<string | null>(null);

   useEffect(() => {
      let frame = 0;
      const schedule = () => {
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => setPins(measurePins()));
      };
      schedule();
      const resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(document.body);
      const mutationObserver = new MutationObserver(schedule);
      const main = document.getElementById("main-content");
      if (main)
         mutationObserver.observe(main, { childList: true, subtree: true });
      window.addEventListener("resize", schedule);
      return () => {
         cancelAnimationFrame(frame);
         resizeObserver.disconnect();
         mutationObserver.disconnect();
         window.removeEventListener("resize", schedule);
      };
   }, []);

   const openIndex = pins.findIndex((pin) => pin.note.id === openId);
   const open = openIndex === -1 ? null : pins[openIndex];

   const goTo = useCallback(
      (index: number) => {
         const target = pins[index];
         if (!target) return;
         setOpenId(target.note.id);
         window.scrollTo({
            top: Math.max(target.top - window.innerHeight / 3, 0),
            behavior: reducedMotion ? "auto" : "smooth",
         });
      },
      [pins, reducedMotion],
   );
   const step = (delta: number) =>
      goTo((openIndex + delta + pins.length) % pins.length);

   useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
         if (event.key !== "Escape") return;
         if (openId) setOpenId(null);
         else setAnnotationsOn(false);
      };
      // A tap anywhere outside the card and the pins closes the open note.
      const onPointerDown = (event: PointerEvent) => {
         const target = event.target as Element | null;
         if (target?.closest(".annotation-card, .annotation-pin")) return;
         setOpenId(null);
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onPointerDown);
      return () => {
         document.removeEventListener("keydown", onKey);
         document.removeEventListener("pointerdown", onPointerDown);
      };
   }, [openId]);

   const cardLeft = open
      ? Math.min(
           Math.max(open.left - CARD_WIDTH / 2 + PIN_SIZE / 2, EDGE),
           document.documentElement.clientWidth - CARD_WIDTH - EDGE,
        )
      : 0;

   return createPortal(
      <div className="annotations-layer">
         {pins.map((pin, index) => (
            <motion.button
               key={pin.note.id}
               type="button"
               className={`annotation-pin${pin.note.id === openId ? " is-open" : ""}`}
               style={{ top: pin.top, left: pin.left }}
               initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{
                  delay: reducedMotion ? 0 : index * 0.05,
                  type: "spring",
                  stiffness: 420,
                  damping: 22,
               }}
               onClick={() =>
                  setOpenId(pin.note.id === openId ? null : pin.note.id)
               }
               aria-expanded={pin.note.id === openId}
               aria-controls="annotation-card"
               aria-label={`Note ${index + 1}: ${pin.note.title}`}
            >
               {index + 1}
            </motion.button>
         ))}

         <AnimatePresence>
            {open && (
               <motion.div
                  key={open.note.id}
                  id="annotation-card"
                  role="dialog"
                  aria-label={open.note.title}
                  className={`annotation-card${isMobile ? " is-sheet" : ""}`}
                  style={
                     isMobile
                        ? undefined
                        : {
                             top: open.top + PIN_SIZE + 10,
                             left: cardLeft,
                             width: CARD_WIDTH,
                          }
                  }
                  initial={
                     reducedMotion
                        ? false
                        : { opacity: 0, y: isMobile ? 24 : 6 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? 24 : 6 }}
                  transition={{ duration: 0.2, ease: EASING.brisk }}
               >
                  <div className="annotation-card-head">
                     <span className="annotation-card-index">
                        {String(openIndex + 1).padStart(2, "0")} /{" "}
                        {String(pins.length).padStart(2, "0")}
                     </span>
                     <button
                        type="button"
                        className="annotation-icon-btn"
                        onClick={() => setOpenId(null)}
                        aria-label="Close note"
                     >
                        <X size={14} aria-hidden="true" />
                     </button>
                  </div>
                  <p className="annotation-card-title">{open.note.title}</p>
                  <p className="annotation-card-body">{open.note.body}</p>
                  <div className="annotation-card-nav">
                     <button
                        type="button"
                        className="annotation-icon-btn"
                        onClick={() => step(-1)}
                        aria-label="Previous note"
                     >
                        <ChevronLeft size={16} aria-hidden="true" />
                     </button>
                     <button
                        type="button"
                        className="annotation-icon-btn"
                        onClick={() => step(1)}
                        aria-label="Next note"
                     >
                        <ChevronRight size={16} aria-hidden="true" />
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {pins.length > 0 && !(isMobile && open) && (
            <motion.div
               className="annotations-banner"
               role="status"
               initial={reducedMotion ? false : { opacity: 0, y: 16 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.25, ease: EASING.brisk }}
            >
               <span>
                  {pins.length} build {pins.length === 1 ? "note" : "notes"}
               </span>
               <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="annotations-banner-btn"
               >
                  Start
               </button>
               <button
                  type="button"
                  onClick={() => setAnnotationsOn(false)}
                  className="annotations-banner-btn"
               >
                  Turn off
               </button>
            </motion.div>
         )}
      </div>,
      document.body,
   );
};

export default AnnotationsLayer;
