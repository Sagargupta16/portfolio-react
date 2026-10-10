/* One glossed term: inline text with a dotted underline that opens a small
   definition card. Fine pointers open it on hover (after a short delay),
   keyboards on focus, touch on tap. The card lives in a portal with fixed
   positioning measured from the trigger, so card overflow and transforms on
   ancestors cannot clip or shift it. Scrolling or resizing closes it rather
   than chasing the term. */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import { MONO_FONT, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";

const FINE_HOVER = "(hover: hover) and (pointer: fine)";
const OPEN_DELAY_MS = 120;
const VIEWPORT_MARGIN = 12;
const TERM_GAP = 6;

interface GlossProps {
   term: string;
   definition: string;
   children: React.ReactNode;
}

const Gloss = ({ term, definition, children }: GlossProps) => {
   const [open, setOpen] = useState(false);
   const triggerRef = useRef<HTMLButtonElement>(null);
   const cardRef = useRef<HTMLDivElement>(null);
   const openTimerRef = useRef<number | undefined>(undefined);
   const cardId = useId();
   const canHover = useMediaQuery(FINE_HOVER);
   const { reducedMotion } = useMotionPreference();

   const cancelOpen = () => globalThis.clearTimeout(openTimerRef.current);
   const show = () => {
      cancelOpen();
      setOpen(true);
   };
   const hide = () => {
      cancelOpen();
      setOpen(false);
   };

   useEffect(() => () => globalThis.clearTimeout(openTimerRef.current), []);

   /* Place the card below the term, or above when the viewport has no room
      below, clamped horizontally inside the margins. Written straight to the
      node before paint, so the first frame is already in place. */
   useLayoutEffect(() => {
      const trigger = triggerRef.current;
      const card = cardRef.current;
      if (!open || !trigger || !card) return;
      const anchor = trigger.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = globalThis.innerHeight;
      const { offsetWidth: width, offsetHeight: height } = card;
      const left = Math.min(
         Math.max(anchor.left + anchor.width / 2 - width / 2, VIEWPORT_MARGIN),
         viewportWidth - VIEWPORT_MARGIN - width,
      );
      const below = anchor.bottom + TERM_GAP;
      const above = anchor.top - TERM_GAP - height;
      const fitsBelow = below + height <= viewportHeight - VIEWPORT_MARGIN;
      const top = fitsBelow || above < VIEWPORT_MARGIN ? below : above;
      card.style.left = `${Math.max(left, VIEWPORT_MARGIN)}px`;
      card.style.top = `${top}px`;
   }, [open]);

   useEffect(() => {
      if (!open) return;
      const close = () => setOpen(false);
      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "Escape") close();
      };
      const onPointerDown = (event: PointerEvent) => {
         if (!triggerRef.current?.contains(event.target as Node)) close();
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("pointerdown", onPointerDown);
      globalThis.addEventListener("scroll", close, {
         capture: true,
         passive: true,
      });
      globalThis.addEventListener("resize", close);
      return () => {
         document.removeEventListener("keydown", onKeyDown);
         document.removeEventListener("pointerdown", onPointerDown);
         globalThis.removeEventListener("scroll", close, { capture: true });
         globalThis.removeEventListener("resize", close);
      };
   }, [open]);

   const onPointerEnter = (event: React.PointerEvent) => {
      if (!canHover || event.pointerType === "touch") return;
      cancelOpen();
      openTimerRef.current = globalThis.setTimeout(
         () => setOpen(true),
         OPEN_DELAY_MS,
      );
   };
   const onPointerLeave = (event: React.PointerEvent) => {
      if (!canHover || event.pointerType === "touch") return;
      hide();
   };
   /* A hover device has usually opened the card already, so a click keeps it
      open instead of toggling it shut; touch taps toggle. */
   const onClick = () => {
      if (canHover) show();
      else setOpen((wasOpen) => !wasOpen);
   };
   const onFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
      if (event.currentTarget.matches(":focus-visible")) show();
   };

   return (
      <>
         <button
            ref={triggerRef}
            type="button"
            className="gloss-term"
            aria-expanded={open}
            aria-describedby={open ? cardId : undefined}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={hide}
         >
            {children}
         </button>
         {createPortal(
            <AnimatePresence>
               {open && (
                  <motion.div
                     ref={cardRef}
                     id={cardId}
                     role="tooltip"
                     initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                     transition={{ duration: 0.16, ease: "easeOut" }}
                     style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        zIndex: 400,
                        maxWidth: "min(280px, calc(100vw - 24px))",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#0e1417",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
                        pointerEvents: "none",
                     }}
                  >
                     <span
                        style={{
                           display: "block",
                           marginBottom: 4,
                           fontFamily: MONO_FONT,
                           fontSize: 10.5,
                           letterSpacing: "0.08em",
                           textTransform: "uppercase",
                           color: TEXT_PRIMARY,
                        }}
                     >
                        {term}
                     </span>
                     <span
                        style={{
                           display: "block",
                           fontSize: 13,
                           lineHeight: 1.5,
                           color: TEXT_SECONDARY,
                        }}
                     >
                        {definition}
                     </span>
                  </motion.div>
               )}
            </AnimatePresence>,
            document.body,
         )}
      </>
   );
};

export default Gloss;
