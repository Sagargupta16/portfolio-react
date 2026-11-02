import { useEffect, type RefObject } from "react";
import useMotionPreference from "./useMotionPreference";

/* Whole sections resume a little before they scroll in. */
export const SECTION_MARGIN = "200px 0px";

type VisibilityListener = (visible: boolean) => void;

interface Watch {
   listeners: Set<VisibilityListener>;
   visible?: boolean;
}

/* One IntersectionObserver per margin for every host on the page: a project
   grid alone has dozens of scene slots. */
const observers = new Map<
   string,
   { observer: IntersectionObserver; watches: Map<Element, Watch> }
>();

const getObserver = (margin: string) => {
   let shared = observers.get(margin);
   if (!shared) {
      const watches = new Map<Element, Watch>();
      const observer = new IntersectionObserver(
         (entries) => {
            // in time order, so a target's last entry wins
            for (const { target, isIntersecting } of entries) {
               const watch = watches.get(target);
               if (!watch) continue;
               watch.visible = isIntersecting;
               for (const listener of watch.listeners) listener(isIntersecting);
            }
         },
         { rootMargin: margin },
      );
      shared = { observer, watches };
      observers.set(margin, shared);
   }
   return shared;
};

/**
 * Calls `listener` with whether `el` is inside the viewport (grown by
 * `margin`), first with its current state and then on every change, as its
 * own IntersectionObserver would. Returns the cleanup.
 */
export const watchVisibility = (
   el: Element,
   margin: string,
   listener: VisibilityListener,
) => {
   const { observer, watches } = getObserver(margin);
   const known = watches.get(el);
   const watch: Watch = known ?? { listeners: new Set() };
   if (!known) {
      watches.set(el, watch);
      observer.observe(el);
   } else if (watch.visible !== undefined) {
      // Already observed: the observer only reports changes from here on.
      listener(watch.visible);
   }
   watch.listeners.add(listener);
   return () => {
      watch.listeners.delete(listener);
      if (watch.listeners.size) return;
      watches.delete(el);
      observer.unobserve(el);
   };
};

/**
 * Pauses every looping animation inside `ref` while it is outside the
 * viewport (grown by `margin`), and resumes each one when it returns.
 *
 * A loop nobody can see still costs a frame on every display refresh, and
 * off-screen Chrome can drop a transform loop from the compositor to the main
 * thread: the Credly rail alone held a whole core at 240 Hz below the fold.
 * CSS loops pause through `data-offscreen` (index.css), not `pause()`, which
 * would pin their play state and break the rails' hover and focus pause.
 * Motion and other Web Animations pause directly. Motion's JS loops (SVG
 * transforms and paths) cannot be paused from here and keep running, so an
 * endless Web Animations loop resumes where it would be by now, not where it
 * stopped, and stays in step with them. Reduced is left to
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

      // each paused animation and the time it was paused at
      const paused = new Map<Animation, number>();
      let offscreen = false;
      let frame = 0;
      let timer = 0;

      const pause = () => {
         if (!offscreen) return;
         const now = performance.now();
         for (const animation of el.getAnimations({ subtree: true })) {
            if (
               animation instanceof CSSAnimation ||
               animation instanceof CSSTransition ||
               animation.playState !== "running"
            )
               continue;
            animation.pause();
            paused.set(animation, now);
         }
      };
      // Motion starts its animations a frame or two after React commits, so
      // look again on the next two frames and once more a little later.
      const sweep = () => {
         pause();
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => {
            pause();
            frame = requestAnimationFrame(pause);
         });
         window.clearTimeout(timer);
         timer = window.setTimeout(pause, 400);
      };
      const resume = () => {
         const now = performance.now();
         for (const [animation, at] of paused) {
            if (animation.playState !== "paused") continue;
            if (animation.effect?.getTiming().iterations === Infinity) {
               animation.currentTime =
                  (Number(animation.currentTime) || 0) + (now - at);
            }
            animation.play();
         }
         paused.clear();
      };

      const stopWatching = watchVisibility(el, margin, (visible) => {
         offscreen = !visible;
         el.toggleAttribute("data-offscreen", offscreen);
         if (offscreen) sweep();
         else resume();
      });
      // Lazy chunks start loops after mount, so a host that is already away
      // catches them as they arrive.
      const mutations = new MutationObserver(() => {
         if (offscreen) sweep();
      });
      mutations.observe(el, { childList: true, subtree: true });

      return () => {
         stopWatching();
         mutations.disconnect();
         cancelAnimationFrame(frame);
         window.clearTimeout(timer);
         resume();
         el.removeAttribute("data-offscreen");
      };
   }, [ref, margin, reducedMotion]);
};

export default usePauseOffscreen;
