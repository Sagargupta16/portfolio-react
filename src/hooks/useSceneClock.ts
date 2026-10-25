import { useEffect, type RefObject } from "react";
import {
   isSceneClockOff,
   onSceneTick,
   sceneClockReady,
} from "@utils/sceneClock";
import useMotionPreference from "./useMotionPreference";

/* Motion starts and rebuilds loops after mount, so look for new ones twice a
   second while the slot is in view. */
const SWEEP_TICKS = 30;

/**
 * Moves the Web Animations loops on a scene slot's SVG parts onto the shared
 * 60 Hz scene clock (see sceneClock) while the slot is in view: each loop is
 * paused and stepped forward by real elapsed time on every tick, so it keeps
 * its place and pace and stays in step with the scene's JS loops on
 * sceneDriver. HTML parts, entrances and CSS animations run as before. Does
 * nothing on screens at 75 Hz or less, or in Reduced, where
 * useFreezeAnimations holds the rest frame.
 */
const useSceneClock = (ref: RefObject<HTMLElement | null>) => {
   const { reducedMotion } = useMotionPreference();

   useEffect(() => {
      const el = ref.current;
      if (reducedMotion || !el || isSceneClockOff()) return;

      const stepped = new Map<Animation, number>();
      let ticks = 0;
      let stopTicks: (() => void) | null = null;
      let active = false;
      let visible = false;
      let cancelled = false;

      const adopt = (now: number) => {
         for (const animation of el.getAnimations({ subtree: true })) {
            const target =
               animation.effect instanceof KeyframeEffect
                  ? animation.effect.target
                  : null;
            if (
               stepped.has(animation) ||
               // HTML parts loop on the compositor already, for free
               !(target instanceof SVGElement) ||
               animation instanceof CSSAnimation ||
               animation.playState !== "running" ||
               animation.effect?.getTiming().iterations !== Infinity
            )
               continue;
            animation.pause();
            stepped.set(animation, now);
         }
      };

      const tick = (now: number) => {
         for (const [animation, at] of stepped) {
            // cancelled, replaced or restarted by Motion: let it go
            if (animation.playState !== "paused") {
               stepped.delete(animation);
               continue;
            }
            animation.currentTime =
               (Number(animation.currentTime) || 0) + (now - at);
            stepped.set(animation, now);
         }
         ticks += 1;
         if (ticks % SWEEP_TICKS === 0) adopt(now);
      };

      const show = () => {
         const now = performance.now();
         for (const animation of stepped.keys()) stepped.set(animation, now);
         adopt(now);
         stopTicks ??= onSceneTick(tick);
      };
      const hide = () => {
         stopTicks?.();
         stopTicks = null;
      };

      const observer = new IntersectionObserver(([entry]) => {
         visible = entry.isIntersecting;
         if (!active) return;
         if (visible) show();
         else hide();
      });
      const mutations = new MutationObserver(() => {
         if (active && visible) adopt(performance.now());
      });
      observer.observe(el);
      mutations.observe(el, { childList: true, subtree: true });
      // The display rate is usually known long before a scene mounts.
      void sceneClockReady.then((on) => {
         if (!on || cancelled) return;
         active = true;
         if (visible) show();
      });

      return () => {
         cancelled = true;
         observer.disconnect();
         mutations.disconnect();
         hide();
         for (const animation of stepped.keys()) {
            if (animation.playState === "paused") animation.play();
         }
      };
   }, [ref, reducedMotion]);
};

export default useSceneClock;
