import { useEffect } from "react";
import { useLenis } from "lenis/react";

// The longest step one frame hands Lenis: two frames at 60 Hz.
const MAX_STEP = 1000 / 30;

/**
 * Runs the root Lenis frame loop only while a smooth scroll is in flight.
 *
 * Lenis's own `autoRaf` asks for a frame on every display refresh for as long
 * as the page is open, so an idle page still ran a full main-thread frame 240
 * times a second on a 240 Hz panel. Every smooth scroll, wheel or
 * programmatic, sets `lenis-smooth` on the root element as it starts, so the
 * loop wakes on that class and sleeps once Lenis settles. Touch, keys and the
 * scrollbar scroll natively and never needed it. Pair with `autoRaf: false`.
 *
 * Lenis steps by the gap between the times it is handed, so it gets a clock
 * of its own: the first frame of a run counts as one 60 Hz frame, and every
 * later frame as its real gap capped at MAX_STEP. Neither the sleep before a
 * run nor a stalled frame inside one can finish a scroll in a single jump.
 */
const useLenisOnDemand = () => {
   const lenis = useLenis();

   useEffect(() => {
      if (!lenis) return;
      const root = lenis.rootElement;
      let frame = 0;
      // Picks up from the last time this instance was handed, so a re-run of
      // the effect never steps its clock backwards.
      let clock = lenis.time;
      let lastTime = 0;

      const tick = (time: number) => {
         clock += lastTime ? Math.min(time - lastTime, MAX_STEP) : 1000 / 60;
         lastTime = time;
         lenis.raf(clock);
         frame =
            lenis.isScrolling === "smooth" ? requestAnimationFrame(tick) : 0;
         if (!frame) lastTime = 0;
      };

      const observer = new MutationObserver(() => {
         if (frame || !root.classList.contains("lenis-smooth")) return;
         frame = requestAnimationFrame(tick);
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      return () => {
         observer.disconnect();
         cancelAnimationFrame(frame);
      };
   }, [lenis]);
};

export default useLenisOnDemand;
