import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Runs the root Lenis frame loop only while a smooth scroll is in flight.
 *
 * Lenis's own `autoRaf` asks for a frame on every display refresh for as long
 * as the page is open, so an idle page still ran a full main-thread frame 240
 * times a second on a 240 Hz panel. Every smooth scroll, wheel or
 * programmatic, sets `lenis-smooth` on the root element as it starts, so the
 * loop wakes on that class and sleeps once Lenis settles. Touch, keys and the
 * scrollbar scroll natively and never needed it. Pair with `autoRaf: false`.
 */
const useLenisOnDemand = () => {
   const lenis = useLenis();

   useEffect(() => {
      if (!lenis) return;
      const root = lenis.rootElement;
      let frame = 0;
      let wokeAt = 0;
      // Lenis steps from the last time it was handed. The clock it sees skips
      // every sleep, so the first step after one is a single frame (as with
      // the always-on loop) instead of finishing the whole scroll at once.
      let fed = 0;
      let slept = 0;
      let last = 0;
      let interval = 1000 / 60;

      const tick = (time: number) => {
         if (last) interval = time - last;
         last = time;
         fed = time - slept;
         lenis.raf(fed);
         frame =
            lenis.isScrolling === "smooth" ? requestAnimationFrame(tick) : 0;
         if (!frame) last = 0;
      };
      const first = (time: number) => {
         slept = time - fed - Math.max(time - wokeAt, interval);
         tick(time);
      };

      const observer = new MutationObserver(() => {
         if (frame || !root.classList.contains("lenis-smooth")) return;
         wokeAt = performance.now();
         frame = requestAnimationFrame(first);
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      return () => {
         observer.disconnect();
         cancelAnimationFrame(frame);
      };
   }, [lenis]);
};

export default useLenisOnDemand;
