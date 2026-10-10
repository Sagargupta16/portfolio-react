import { useCallback, useLayoutEffect, useRef } from "react";
import { useLenis } from "lenis/react";

// Same nav offset section navigation scrolls with.
const NAV_OFFSET = 64;

interface Anchor {
   el: HTMLElement;
   top: number;
}

/**
 * Keeps a control at the same viewport y when the list above it shrinks
 * ("Show less", or a filter swap while expanded), so the visitor is not left
 * far below the section. Call `hold(el)` right before a state change that
 * re-renders; after that render the page scrolls by however far `el` moved.
 * When that would need a negative scroll, or `el` is gone, the section
 * heading comes into view under the nav instead.
 */
const useScrollAnchor = (sectionId: string) => {
   const lenis = useLenis();
   const anchorRef = useRef<Anchor | null>(null);

   const hold = useCallback((el: HTMLElement) => {
      anchorRef.current = { el, top: el.getBoundingClientRect().top };
   }, []);

   // No deps: runs after every render, and only acts on a held anchor.
   useLayoutEffect(() => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      anchorRef.current = null;

      // Lenis owns scrolling in Full mode; Reduced unmounts it.
      const scrollTo = (top: number) => {
         if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
         else globalThis.scrollTo({ top, behavior: "instant" });
      };
      const delta = anchor.el.isConnected
         ? anchor.el.getBoundingClientRect().top - anchor.top
         : Number.NaN;
      const target = globalThis.scrollY + delta;
      if (target >= 0) {
         if (Math.abs(delta) >= 1) scrollTo(target);
         return;
      }
      const section = document.getElementById(sectionId);
      if (section) {
         scrollTo(
            section.getBoundingClientRect().top +
               globalThis.scrollY -
               NAV_OFFSET,
         );
      }
   });

   return hold;
};

export default useScrollAnchor;
