import { useEffect, type RefObject } from "react";
import { useMotionValue, useSpring } from "motion/react";

/* Slow and heavily damped: the field trails the pointer instead of tracking it. */
const PARALLAX_SPRING = { stiffness: 40, damping: 20 };

/**
 * Pointer position over `hostRef` as two springs in -1..1, 0 at the viewport
 * centre. One passive pointermove listener writes two MotionValues and the
 * springs do the rest, so nothing re-renders; leaving the host eases both
 * back to rest.
 *
 * Callers gate this on the in-app motion preference and on (hover: hover)
 * by only mounting a component that calls it: in Reduced mode and on touch
 * devices neither the listener nor the springs exist.
 */
const usePointerParallax = (hostRef: RefObject<HTMLElement | null>) => {
   const pointerX = useMotionValue(0);
   const pointerY = useMotionValue(0);
   const x = useSpring(pointerX, PARALLAX_SPRING);
   const y = useSpring(pointerY, PARALLAX_SPRING);

   useEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      const onMove = (event: PointerEvent) => {
         pointerX.set((event.clientX / globalThis.innerWidth) * 2 - 1);
         pointerY.set((event.clientY / globalThis.innerHeight) * 2 - 1);
      };
      const onLeave = () => {
         pointerX.set(0);
         pointerY.set(0);
      };

      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerleave", onLeave);
      return () => {
         host.removeEventListener("pointermove", onMove);
         host.removeEventListener("pointerleave", onLeave);
      };
   }, [hostRef, pointerX, pointerY]);

   return { x, y };
};

export default usePointerParallax;
