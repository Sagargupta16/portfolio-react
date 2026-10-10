import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import usePointerLook from "@hooks/usePointerLook";
import useMotionPreference from "@hooks/useMotionPreference";
import portrait from "@assets/brand/sagar-bust.webp";

/* Cartoon bust of him, the same character as the section Mascot (both made
   from his photos). It leans toward the pointer, floats on a slow CSS loop
   (.sagar-face), and on hover or tap squashes, catches a glint across the
   sunglasses and throws three spark ticks, the comic sheet's "wink" pose
   (a wink would hide behind the lenses). Decorative only. */

const SQUASH = {
   scaleX: [1, 1.1, 0.95, 1.03, 1],
   scaleY: [1, 0.86, 1.08, 0.97, 1],
   transition: { duration: 0.55, ease: "easeOut" as const },
};

// Lens boxes measured on the 384 px bust, as percentages of the image.
const LENSES = [
   { left: "36.5%", top: "25.8%", width: "17%", height: "10.7%", rotate: 4 },
   { left: "54.7%", top: "28.2%", width: "12.6%", height: "10.8%", rotate: 9 },
];

// Spark ticks off the right temple, like the sheet's wink frame.
const SPARKS = [
   { x1: 2, y1: 10, x2: 14, y2: 4 },
   { x1: 4, y1: 18, x2: 17, y2: 18 },
   { x1: 2, y1: 26, x2: 14, y2: 32 },
];

const glint: Variants = {
   rest: { x: "-120%", opacity: 0 },
   // Per-property timing: the sweep eases across the lens while the fade
   // runs on its own per-segment curve (a single ease would drift on WAAPI).
   wink: {
      x: ["-120%", "260%"],
      opacity: [0, 1, 0],
      transition: {
         x: { duration: 0.7, ease: "easeInOut" },
         opacity: {
            duration: 0.7,
            times: [0, 0.45, 1],
            ease: ["easeOut", "easeIn"],
         },
      },
   },
};

const spark: Variants = {
   rest: { opacity: 0, scale: 0.4 },
   wink: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0.4, 1, 1.15],
      transition: {
         duration: 0.7,
         delay: 0.08 + i * 0.05,
         times: [0, 0.35, 1],
         ease: ["easeOut", "easeIn"],
      },
   }),
};

interface SagarFaceProps {
   size: number;
}

const SagarFace = ({ size }: SagarFaceProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const { reducedMotion } = useMotionPreference();
   const look = usePointerLook(ref, 4, 5);
   const gesture = reducedMotion ? undefined : "wink";

   return (
      <div
         ref={ref}
         className="sagar-face"
         style={{ width: size, height: size }}
      >
         <motion.div
            initial="rest"
            animate="rest"
            whileHover={gesture}
            whileTap={gesture}
            style={{
               position: "relative",
               width: size,
               height: size,
               x: look.x,
               y: look.y,
               rotate: look.rotate,
               originY: 0.9,
            }}
         >
            <motion.img
               src={portrait}
               alt=""
               width={size}
               height={size}
               draggable={false}
               style={{ display: "block" }}
               variants={{ rest: {}, wink: SQUASH }}
            />
            {LENSES.map((lens) => (
               <span
                  key={lens.left}
                  aria-hidden="true"
                  className="sagar-face-lens"
                  style={{
                     left: lens.left,
                     top: lens.top,
                     width: lens.width,
                     height: lens.height,
                     rotate: `${lens.rotate}deg`,
                  }}
               >
                  <motion.span className="sagar-face-glint" variants={glint} />
               </span>
            ))}
            <svg
               aria-hidden="true"
               className="sagar-face-sparks"
               viewBox="0 0 20 36"
            >
               {SPARKS.map((s, i) => (
                  <motion.line
                     key={`${s.x1}-${s.y1}`}
                     {...s}
                     custom={i}
                     variants={spark}
                  />
               ))}
            </svg>
         </motion.div>
      </div>
   );
};

export default SagarFace;
