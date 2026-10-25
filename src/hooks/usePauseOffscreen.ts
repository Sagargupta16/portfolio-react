import { useEffect, type RefObject } from "react";
import useMotionPreference from "./useMotionPreference";

/* Whole sections resume a little before they scroll in. */
export const SECTION_MARGIN = "200px 0px";

/**
 * Pauses every looping animation inside `ref` while it is outside the
 * viewport (grown by `margin`), and resumes each one where it stopped.
 *
 * A loop nobody can see still costs a frame on every display refresh, and
 * off-screen Chrome can drop a transform loop from the compositor to the main
 * thread: the Credly rail alone held a whole core at 240 Hz below the fold.
 * CSS loops pause through `data-offscreen` (index.css), not `pause()`, which
 * would pin their play state and break the rails' hover and focus pause.
 * Motion and other Web Animations pause directly. Reduced is left to
 * useFreezeAnimations, which holds those loops on their rest frame.
 */
const usePauseOffscreen = (
   ref: RefObject<HTMLElement | null>,
   margin = "0px",
) => {
   const { reducedMotion } = useMotionPreference();

   useEffect(() => {
      const el = ref.current;
      if (reducedMotion || !el) return;

      const paused = new Set<Animation>();
      let offscreen = false;

      const pause = () => {
         for (const animation of el.getAnimations({ subtree: true })) {
            if (
               animation instanceof CSSAnimation ||
               animation instanceof CSSTransition ||
               animation.playState !== "running"
            )
               continue;
            animation.pause();
            paused.add(animation);
         }
      };
      const resume = () => {
         for (const animation of paused) {
            if (animation.playState === "paused") animation.play();
         }
         paused.clear();
      };

      const observer = new IntersectionObserver(
         ([entry]) => {
            offscreen = !entry.isIntersecting;
            el.toggleAttribute("data-offscreen", offscreen);
            if (offscreen) pause();
            else resume();
         },
         { rootMargin: margin },
      );
      // Lazy chunks and Motion start loops after mount, so a host that is
      // already away catches them as they arrive.
      const mutations = new MutationObserver(() => {
         if (offscreen) pause();
      });
      observer.observe(el);
      mutations.observe(el, { childList: true, subtree: true });

      return () => {
         observer.disconnect();
         mutations.disconnect();
         resume();
         el.removeAttribute("data-offscreen");
      };
   }, [ref, margin, reducedMotion]);
};

export default usePauseOffscreen;
