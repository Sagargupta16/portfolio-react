import { motion } from "motion/react";
import useReducedMotion from "@hooks/useReducedMotion";
import useBreakpoint from "@hooks/useBreakpoint";
import { CYAN, PURPLE, PINK, AMBER } from "@/constants/theme";

// Each blob is anchored at a fixed viewport position (left/top, set once) and
// drifts via translate (x/y in px) -- a compositor-only animation. Animating
// left/top would force a layout + paint every frame on a blur(80px) layer, which
// is exactly what makes scrolling janky; translate stays on the GPU.
const BLOBS = [
   {
      color: CYAN,
      rx: 300,
      ry: 220,
      opacity: 0.08,
      left: "15%",
      top: "18%",
      x: [0, 90, -40, 60, 0],
      y: [0, 70, 110, -30, 0],
      duration: 22,
   },
   {
      color: PURPLE,
      rx: 260,
      ry: 300,
      opacity: 0.07,
      left: "78%",
      top: "62%",
      x: [0, -120, 40, -80, 0],
      y: [0, -90, 60, -40, 0],
      duration: 18,
   },
   {
      color: PINK,
      rx: 280,
      ry: 240,
      opacity: 0.06,
      left: "48%",
      top: "20%",
      x: [0, 110, -90, 70, 0],
      y: [0, 80, 120, 40, 0],
      duration: 25,
   },
   {
      color: AMBER,
      rx: 240,
      ry: 280,
      opacity: 0.09,
      left: "25%",
      top: "78%",
      x: [0, 100, 60, -70, 0],
      y: [0, -110, -40, -80, 0],
      duration: 20,
   },
] as const;

const AuroraBlobs = () => {
   const reducedMotion = useReducedMotion();
   const { isMobile } = useBreakpoint();
   // Halve the blurred (blur(80px)) layers on phones -- each is a continuously
   // repainting fixed layer, the heaviest sustained GPU cost on mobile. Motion
   // stays fully visible, just fewer simultaneous blobs.
   const blobs = isMobile ? BLOBS.slice(0, 2) : BLOBS;

   return (
      <div
         aria-hidden="true"
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
         }}
      >
         {blobs.map((blob) => (
            <motion.div
               key={blob.color}
               animate={
                  reducedMotion ? undefined : { x: [...blob.x], y: [...blob.y] }
               }
               transition={
                  reducedMotion
                     ? undefined
                     : {
                          duration: blob.duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                       }
               }
               style={{
                  position: "absolute",
                  left: blob.left,
                  top: blob.top,
                  width: blob.rx,
                  height: blob.ry,
                  borderRadius: "50%",
                  background: blob.color,
                  opacity: blob.opacity,
                  filter: "blur(80px)",
                  willChange: "transform",
               }}
            />
         ))}
      </div>
   );
};

export default AuroraBlobs;
