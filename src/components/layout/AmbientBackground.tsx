import { motion } from "motion/react";
import type { Easing } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";

/**
 * Site-wide premium backdrop (aceternity/reactbits-style, CSS only):
 * - three slow-drifting radial glows in the blue family (wide gradient
 *   stops give the soft falloff; no CSS effects on any layer). Each glow
 *   animates `transform` directly so Motion hands the loop to WAAPI and the
 *   compositor owns the layer while it runs: no will-change, no repaint.
 * - a faint dot lattice
 * - two diagonal light beams sweeping on long loops
 * Fixed, behind everything, pointer-events none. Transform/opacity only.
 */
const EASE_IN_OUT: Easing = "easeInOut";
// Three-keyframe loops: one ease per segment so every layer returns to frame 0.
const GLOW_EASE: Easing[] = [EASE_IN_OUT, EASE_IN_OUT];
/** Out-and-back drift between two transforms, landing on the first frame. */
const drift = (from: string, to: string) => ({ transform: [from, to, from] });

/* Beams: a 0 -> 140vw sweep at constant speed, tilted 24deg. The sweep is a
   `transform` string so WAAPI runs it on the compositor; an animated transform
   replaces the inline one, so the tilt rides in every keyframe (it also stays
   in style for the frames before the sweep starts). Keyframed on the fade's
   `times`, linear throughout, it is the same straight run as a two-frame
   0 -> 140vw tween while both tracks share one schedule. */
const BEAM_TILT = 24;
const BEAM_TIMES = [0, 0.1, 0.9, 1];
const beamAt = (vw: number) => `translateX(${vw}vw) rotate(${BEAM_TILT}deg)`;
const BEAM_SWEEP = [0, 14, 126, 140].map(beamAt);

const glowStyle = {
   position: "absolute",
   borderRadius: "50%",
} as const;

const AmbientBackground = () => {
   const { preference, reducedMotion } = useMotionPreference();

   return (
      <div
         key={preference}
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
                  "radial-gradient(rgb(var(--ch-white) / 0.04) 1px, transparent 1px)",
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
               ...glowStyle,
               top: "-30%",
               left: "50%",
               width: 1100,
               height: 800,
               marginLeft: -550,
               background:
                  "radial-gradient(ellipse at center, rgb(var(--ch-blue) / 0.14), rgb(var(--ch-sky) / 0.05) 40%, transparent 75%)",
            }}
            animate={
               reducedMotion
                  ? undefined
                  : drift(
                       "translate(-80px, 0px) scale(1)",
                       "translate(80px, 40px) scale(1.08)",
                    )
            }
            transition={{ duration: 26, repeat: Infinity, ease: GLOW_EASE }}
         />

         {/* Aurora glow: bottom-right teal (echoes the footer fade) */}
         <motion.div
            style={{
               ...glowStyle,
               bottom: "-35%",
               right: "-15%",
               width: 900,
               height: 700,
               background:
                  "radial-gradient(ellipse at center, rgb(34 130 143 / 0.12), transparent 70%)",
            }}
            animate={
               reducedMotion
                  ? undefined
                  : drift("translate(40px, 20px)", "translate(-60px, -30px)")
            }
            transition={{ duration: 32, repeat: Infinity, ease: GLOW_EASE }}
         />

         {/* Aurora glow: bottom-left depth layer, slowest, counter-drifting */}
         <motion.div
            style={{
               ...glowStyle,
               bottom: "-25%",
               left: "-15%",
               width: 700,
               height: 600,
               background:
                  "radial-gradient(ellipse at center, rgb(var(--ch-blue) / 0.07), transparent 70%)",
            }}
            animate={
               reducedMotion
                  ? undefined
                  : drift("translate(30px, -20px)", "translate(-40px, 30px)")
            }
            transition={{ duration: 40, repeat: Infinity, ease: GLOW_EASE }}
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
                  "linear-gradient(180deg, transparent, rgb(var(--ch-blue-light) / 0.35) 30%, rgb(var(--ch-blue-light) / 0.35) 70%, transparent)",
               rotate: BEAM_TILT,
               transformOrigin: "top center",
               opacity: reducedMotion ? 0 : undefined,
            }}
            animate={
               reducedMotion
                  ? undefined
                  : { transform: BEAM_SWEEP, opacity: [0, 0.9, 0.9, 0] }
            }
            transition={{
               duration: 14,
               repeat: Infinity,
               ease: "linear",
               times: BEAM_TIMES,
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
                  "linear-gradient(180deg, transparent, rgb(var(--ch-sky) / 0.22) 30%, rgb(var(--ch-sky) / 0.22) 70%, transparent)",
               rotate: BEAM_TILT,
               transformOrigin: "top center",
               opacity: reducedMotion ? 0 : undefined,
            }}
            animate={
               reducedMotion
                  ? undefined
                  : { transform: BEAM_SWEEP, opacity: [0, 0.8, 0.8, 0] }
            }
            transition={{
               duration: 21,
               repeat: Infinity,
               ease: "linear",
               delay: 7,
               times: BEAM_TIMES,
            }}
         />

         {/* Vignette to keep edges near-black and text contrast high */}
         <div
            style={{
               position: "absolute",
               inset: 0,
               background:
                  "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 50%, rgb(var(--ch-bg) / 0.85) 100%)",
            }}
         />
      </div>
   );
};

export default AmbientBackground;
