import { motion } from "motion/react";

/**
 * Site-wide premium backdrop (aceternity/reactbits-style, CSS only):
 * - two slow-drifting radial aurora glows in the blue family
 * - a faint dot lattice
 * - two diagonal light beams sweeping on long loops
 * Fixed, behind everything, pointer-events none. Transform/opacity only.
 */
const AmbientBackground = () => (
   <div
      aria-hidden="true"
      style={{
         position: "fixed",
         inset: 0,
         zIndex: -1,
         overflow: "hidden",
         background: "var(--color-bg-primary)",
      }}
   >
      {/* Dot lattice */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
               "radial-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
               "radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 80%)",
            WebkitMaskImage:
               "radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 80%)",
         }}
      />

      {/* Aurora glow: top */}
      <motion.div
         style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            width: 1100,
            height: 800,
            marginLeft: -550,
            borderRadius: "50%",
            background:
               "radial-gradient(ellipse at center, rgb(37 99 235 / 0.14), rgb(34 211 238 / 0.05) 45%, transparent 70%)",
            filter: "blur(60px)",
            willChange: "transform",
         }}
         animate={{ x: [-80, 80, -80], y: [0, 40, 0], scale: [1, 1.08, 1] }}
         transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora glow: bottom-right teal (echoes the footer fade) */}
      <motion.div
         style={{
            position: "absolute",
            bottom: "-35%",
            right: "-15%",
            width: 900,
            height: 700,
            borderRadius: "50%",
            background:
               "radial-gradient(ellipse at center, rgb(34 130 143 / 0.12), transparent 65%)",
            filter: "blur(70px)",
            willChange: "transform",
         }}
         animate={{ x: [40, -60, 40], y: [20, -30, 20] }}
         transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Beam 1: thin diagonal light streak sweeping across */}
      <motion.div
         style={{
            position: "absolute",
            top: "-10%",
            left: "-20%",
            width: 1,
            height: "130%",
            background:
               "linear-gradient(180deg, transparent, rgb(96 165 250 / 0.35) 30%, rgb(96 165 250 / 0.35) 70%, transparent)",
            transform: "rotate(24deg)",
            transformOrigin: "top center",
            willChange: "transform, opacity",
         }}
         animate={{ x: ["0vw", "140vw"], opacity: [0, 0.9, 0.9, 0] }}
         transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.9, 1],
         }}
      />

      {/* Beam 2: slower, fainter, offset phase */}
      <motion.div
         style={{
            position: "absolute",
            top: "-10%",
            left: "-20%",
            width: 1,
            height: "130%",
            background:
               "linear-gradient(180deg, transparent, rgb(56 189 248 / 0.22) 30%, rgb(56 189 248 / 0.22) 70%, transparent)",
            transform: "rotate(24deg)",
            transformOrigin: "top center",
            willChange: "transform, opacity",
         }}
         animate={{ x: ["0vw", "140vw"], opacity: [0, 0.8, 0.8, 0] }}
         transition={{
            duration: 21,
            repeat: Infinity,
            ease: "linear",
            delay: 7,
            times: [0, 0.1, 0.9, 1],
         }}
      />

      {/* Vignette to keep edges near-black and text contrast high */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            background:
               "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 50%, rgb(11 16 18 / 0.85) 100%)",
         }}
      />
   </div>
);

export default AmbientBackground;
