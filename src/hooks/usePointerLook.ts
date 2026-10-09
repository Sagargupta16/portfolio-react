import { useEffect, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";

const SPRING = { stiffness: 120, damping: 18, mass: 0.6 };

interface PointerLook {
   x: MotionValue<number>;
   y: MotionValue<number>;
   rotate: MotionValue<number>;
}

/**
 * Makes an element "look" toward the pointer: it shifts up to `maxOffset` px
 * and tilts up to `maxTilt` degrees in the pointer's direction, on a spring.
 * Fine pointers only (touch has no hover position); off in Reduced motion.
 * One passive window listener, throttled to one update per frame.
 */
const usePointerLook = (
   ref: RefObject<HTMLElement | null>,
   maxOffset = 6,
   maxTilt = 6,
): PointerLook => {
   const { reducedMotion } = useMotionPreference();
   const rawX = useMotionValue(0);
   const rawY = useMotionValue(0);
   const rawRotate = useMotionValue(0);
   const x = useSpring(rawX, SPRING);
   const y = useSpring(rawY, SPRING);
   const rotate = useSpring(rawRotate, SPRING);

   useEffect(() => {
      const finePointer = globalThis.matchMedia?.("(pointer: fine)").matches;
      if (reducedMotion || !finePointer) {
         rawX.set(0);
         rawY.set(0);
         rawRotate.set(0);
         return;
      }
      let frame = 0;
      let pointer = { x: 0, y: 0 };
      const update = () => {
         frame = 0;
         const el = ref.current;
         if (!el) return;
         const box = el.getBoundingClientRect();
         const dx = pointer.x - (box.left + box.width / 2);
         const dy = pointer.y - (box.top + box.height / 2);
         const distance = Math.hypot(dx, dy) || 1;
         // Full lean at 400px away or more; eases in closer to the centre.
         const reach = Math.min(distance / 400, 1);
         rawX.set((dx / distance) * maxOffset * reach);
         rawY.set((dy / distance) * maxOffset * reach);
         rawRotate.set((dx / distance) * maxTilt * reach);
      };
      const onMove = (event: PointerEvent) => {
         pointer = { x: event.clientX, y: event.clientY };
         if (!frame) frame = requestAnimationFrame(update);
      };
      globalThis.addEventListener("pointermove", onMove, { passive: true });
      return () => {
         globalThis.removeEventListener("pointermove", onMove);
         if (frame) cancelAnimationFrame(frame);
      };
   }, [ref, reducedMotion, maxOffset, maxTilt, rawX, rawY, rawRotate]);

   return { x, y, rotate };
};

export default usePointerLook;
