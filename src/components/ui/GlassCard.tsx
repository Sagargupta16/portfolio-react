import type { ReactNode } from "react";
import {
   motion,
   useMotionValue,
   useSpring,
   useTransform,
   type HTMLMotionProps,
} from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";

interface GlassCardOwnProps {
   children: ReactNode;
}

type GlassCardProps = GlassCardOwnProps &
   Omit<HTMLMotionProps<"div">, keyof GlassCardOwnProps>;

/* Pointer tilt: the edge under the cursor presses away by at most this much. */
const MAX_TILT_DEG = 4;
const TILT_SPRING = { stiffness: 200, damping: 25 };
const HOVER_CAPABLE = "(hover: hover)";

/**
 * Flat bordered card. CSS (.glass-card) owns the border and background hover;
 * consumers own the lift through whileHover/whileFocus. The tilt lives in
 * motion values only, so Motion composes it with those transforms and a
 * pointer move never reaches React. Touch devices and Reduced get no tilt.
 */
const GlassCard = ({
   children,
   className = "",
   style,
   onPointerMove,
   onPointerLeave,
   ...props
}: GlassCardProps) => {
   const { reducedMotion } = useMotionPreference();
   const hoverCapable = useMediaQuery(HOVER_CAPABLE);
   const tiltEnabled = hoverCapable && !reducedMotion;

   // Pointer position inside the card, -0.5 (left / top) to 0.5 (right / bottom).
   const pointerX = useMotionValue(0);
   const pointerY = useMotionValue(0);
   const springX = useSpring(pointerX, TILT_SPRING);
   const springY = useSpring(pointerY, TILT_SPRING);
   const rotateX = useTransform(
      springY,
      [-0.5, 0.5],
      [MAX_TILT_DEG, -MAX_TILT_DEG],
   );
   const rotateY = useTransform(
      springX,
      [-0.5, 0.5],
      [-MAX_TILT_DEG, MAX_TILT_DEG],
   );

   const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      if (!tiltEnabled || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
   };

   const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      pointerX.set(0);
      pointerY.set(0);
   };

   const tiltStyle = tiltEnabled
      ? { transformPerspective: 800, rotateX, rotateY }
      : undefined;

   return (
      <motion.div
         className={`glass-card ${className}`}
         style={{ ...tiltStyle, ...style }}
         onPointerMove={handlePointerMove}
         onPointerLeave={handlePointerLeave}
         {...props}
      >
         {children}
      </motion.div>
   );
};

export default GlassCard;
