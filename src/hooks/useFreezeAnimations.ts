import { useEffect, type RefObject } from "react";
import useMotionPreference from "./useMotionPreference";

/**
 * Freezes every Web Animations API animation inside `ref` while the in-app
 * preference is Reduced.
 *
 * Motion's `reducedMotion="always"` makes transform loops instant, but the
 * opacity loops in cover scenes and service artwork keep running through
 * WAAPI, so the dots kept blinking in place. Pausing at time 0 shows each
 * loop's rest frame and keeps the artwork visible and still. Leaving Reduced
 * remounts the tree (the provider keys its children on the resolved mode), so
 * no resume path is needed here.
 */
const useFreezeAnimations = (ref: RefObject<HTMLElement | null>) => {
   const { reducedMotion } = useMotionPreference();

   useEffect(() => {
      const el = ref.current;
      if (!reducedMotion || !el) return;

      const freeze = () => {
         for (const animation of el.getAnimations({ subtree: true })) {
            animation.pause();
            animation.currentTime = 0;
         }
      };

      // Motion starts its animations a frame or two after React commits, and
      // lazy scenes mount later still, so sweep now, on the next frames, and
      // after every subtree mutation.
      let frame = 0;
      let timer = 0;
      const sweep = () => {
         freeze();
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => {
            freeze();
            frame = requestAnimationFrame(freeze);
         });
         window.clearTimeout(timer);
         timer = window.setTimeout(freeze, 400);
      };

      sweep();
      const observer = new MutationObserver(sweep);
      observer.observe(el, { childList: true, subtree: true });

      return () => {
         observer.disconnect();
         cancelAnimationFrame(frame);
         window.clearTimeout(timer);
      };
   }, [ref, reducedMotion]);
};

export default useFreezeAnimations;
