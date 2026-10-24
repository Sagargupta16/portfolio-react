import { useEffect } from "react";
import { useLenis } from "lenis/react";

/* Page scroll lock shared by every overlay, ref-counted so a second overlay
   closing never unlocks the page under the first. Two parts, because either
   alone leaks: the root element owns the viewport scroller (body overflow
   never reaches it while html sets overflow-x), and Lenis drives the wheel
   itself through window.scrollTo, which overflow does not stop. Lenis is absent
   in Reduced mode. A stopped Lenis cancels every wheel and touch gesture
   outside a data-lenis-prevent element, so the overlay's own scroller carries
   that attribute. */

let lockCount = 0;
let previousOverflow = "";

/**
 * True while any overlay (modal, mobile menu) holds the page. The closing
 * render's effect cleanup releases it, before any exit animation ends.
 */
export const isScrollLocked = () => lockCount > 0;

const useScrollLock = (active: boolean) => {
   const lenis = useLenis();

   useEffect(() => {
      if (!active) return;
      const root = document.documentElement;
      if (lockCount === 0) {
         previousOverflow = root.style.overflow;
         root.style.overflow = "hidden";
      }
      lockCount += 1;
      lenis?.stop();
      return () => {
         lockCount -= 1;
         if (lockCount > 0) return;
         root.style.overflow = previousOverflow;
         lenis?.start();
      };
   }, [active, lenis]);
};

export default useScrollLock;
