import { useEffect, type RefObject } from "react";
import { useMotionValue, useSpring } from "motion/react";

/* Slow and heavily damped: the field trails the pointer instead of tracking it. */
const PARALLAX_SPRING = { stiffness: 40, damping: 20 };

interface PointerParallaxOptions {
   /** Element that receives the pointer; the document root when omitted. */
   host?: RefObject<HTMLElement | null>;
   /** False leaves both springs at rest and attaches no listener. */
   enabled?: boolean;
}

/**
 * Pointer position over the host as two springs in -1..1, 0 at the viewport
 * centre. One passive pointermove listener writes two MotionValues and the
 * springs do the rest, so nothing re-renders; leaving the host eases both
 * back to rest.
 *
 * Callers gate this on the in-app motion preference by only mounting a
 * component that calls it, and on (hover: hover) through `enabled`: in
 * Reduced mode the springs do not exist, on touch devices no listener does.
 */
const usePointerParallax = ({
   host,
   enabled = true,
}: PointerParallaxOptions = {}) => {
   const pointerX = useMotionValue(0);
   const pointerY = useMotionValue(0);
   const x = useSpring(pointerX, PARALLAX_SPRING);
   const y = useSpring(pointerY, PARALLAX_SPRING);

   useEffect(() => {
      if (!enabled) return;
      const target = host ? host.current : document.documentElement;
      if (!target) return;

      const onMove = (event: PointerEvent) => {
         pointerX.set((event.clientX / globalThis.innerWidth) * 2 - 1);
         pointerY.set((event.clientY / globalThis.innerHeight) * 2 - 1);
      };
      const onLeave = () => {
         pointerX.set(0);
         pointerY.set(0);
      };

      target.addEventListener("pointermove", onMove, { passive: true });
      target.addEventListener("pointerleave", onLeave);
      return () => {
         target.removeEventListener("pointermove", onMove);
         target.removeEventListener("pointerleave", onLeave);
      };
   }, [host, enabled, pointerX, pointerY]);

   return { x, y };
};

export default usePointerParallax;
