import { useRef } from "react";
import { motion } from "motion/react";
import usePointerLook from "@hooks/usePointerLook";
import useMotionPreference from "@hooks/useMotionPreference";
import portrait from "@assets/brand/sagar-bust.webp";

/* Cartoon bust of him, the same character as the section Mascot (both made
   from his photos). It leans toward the pointer, floats on a slow CSS loop
   (.sagar-face), and squashes on hover or tap like palakonweb.in's mascot.
   Decorative only. */

const SQUASH = {
   scaleX: [1, 1.1, 0.95, 1.03, 1],
   scaleY: [1, 0.86, 1.08, 0.97, 1],
   transition: { duration: 0.55, ease: "easeOut" as const },
};

interface SagarFaceProps {
   size: number;
}

const SagarFace = ({ size }: SagarFaceProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const { reducedMotion } = useMotionPreference();
   const look = usePointerLook(ref, 4, 5);

   return (
      <div
         ref={ref}
         className="sagar-face"
         style={{ width: size, height: size }}
      >
         <motion.img
            src={portrait}
            alt=""
            width={size}
            height={size}
            draggable={false}
            style={{
               display: "block",
               x: look.x,
               y: look.y,
               rotate: look.rotate,
               originY: 0.9,
            }}
            whileHover={reducedMotion ? undefined : SQUASH}
            whileTap={reducedMotion ? undefined : SQUASH}
         />
      </div>
   );
};

export default SagarFace;
