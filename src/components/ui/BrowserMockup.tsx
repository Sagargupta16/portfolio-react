import type { ReactNode } from "react";
import {
   motion,
   useInView,
   useScroll,
   useSpring,
   useTransform,
} from "motion/react";
import { useRef } from "react";
import {
   MONO_FONT,
   TEXT_MUTED,
   CHROME_BAR_STYLE,
   EASING,
   DURATION,
} from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";

interface BrowserMockupProps {
   children: ReactNode;
   path?: string[];
   tiltDeg?: number;
}

const DOT_STYLE = {
   width: 8,
   height: 8,
   borderRadius: "50%",
   background: "rgb(var(--ch-white) / 0.12)",
} as const;

// The frame starts STAND_UP_DEG further back and stands up to tiltDeg as it
// scrolls in, settling once its centre reaches the viewport centre.
const STAND_UP_DEG = 15;
const TILT_SPRING = { stiffness: 80, damping: 25 } as const;

const FRAME_HIDDEN = { opacity: 0, scale: 0.94, y: 40 };
const FRAME_VISIBLE = { opacity: 1, scale: 1, y: 0 };
const CONTENT_HIDDEN = { opacity: 0, y: 20 };
const CONTENT_VISIBLE = { opacity: 1, y: 0 };

// Chrome details follow the frame; the last one starts at 0.6s.
const HAIRLINE_DELAY = 0.2;
const CONTENT_DELAY = 0.3;
const DOTS_DELAY = 0.3;
const DOTS_STAGGER = 0.08;
const PATH_DELAY = 0.4;
const PATH_STAGGER = 0.1;
const ACTIVITY_DELAY = 0.45;
const ACTIVITY_STAGGER = 0.05;

const BrowserMockup = ({
   children,
   path = ["sagargupta16", "contributions"],
   tiltDeg = 48,
}: BrowserMockupProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const { reducedMotion } = useMotionPreference();
   const isInView = useInView(ref, {
      once: true,
      margin: "0px 0px -100px 0px",
   });

   // Scroll-linked values bypass MotionConfig, so Reduced pins the tilt below.
   const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "center center"],
   });
   const scrollTilt = useTransform(
      scrollYProgress,
      [0, 1],
      [tiltDeg + STAND_UP_DEG, tiltDeg],
   );
   const rotateX = useSpring(scrollTilt, TILT_SPRING);

   return (
      <div
         ref={ref}
         style={{
            perspective: "min(1400px, 100vw)",
            perspectiveOrigin: "50% 40%",
            // The rotateX projection bulges wider than the layout box at the
            // bottom edge, which creates horizontal page scroll on phones.
            // The bottom is already faded out by the mask, so clipping the
            // sideways spill is visually free.
            overflowX: "clip",
         }}
      >
         <motion.div
            initial={FRAME_HIDDEN}
            animate={isInView ? FRAME_VISIBLE : FRAME_HIDDEN}
            transition={{
               duration: DURATION.slow,
               ease: EASING.cinematic,
            }}
            style={{
               rotateX: reducedMotion ? tiltDeg : rotateX,
               transformOrigin: "50% 2%",
               borderRadius: 12,
               overflow: "hidden",
               border: "1px solid rgb(var(--ch-white) / 0.08)",
               background: "rgb(var(--ch-glass) / 0.5)",
               boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgb(var(--ch-white) / 0.04)
               `,
               maskImage:
                  "linear-gradient(black 50%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)",
               WebkitMaskImage:
                  "linear-gradient(black 50%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)",
            }}
         >
            {/* Top edge hairline */}
            <motion.div
               aria-hidden
               initial={{ scaleX: 0, opacity: 0 }}
               animate={
                  isInView
                     ? { scaleX: 1, opacity: 1 }
                     : { scaleX: 0, opacity: 0 }
               }
               transition={{
                  duration: DURATION.slow,
                  delay: HAIRLINE_DELAY,
                  ease: EASING.cinematic,
               }}
               style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: 1,
                  background:
                     "linear-gradient(90deg, transparent, rgb(var(--ch-cyan) / 0.5), transparent)",
                  zIndex: 10,
                  transformOrigin: "center",
               }}
            />

            {/* Browser chrome bar */}
            <div
               style={{
                  ...CHROME_BAR_STYLE,
                  height: 40,
                  padding: "0 14px",
                  gap: 4,
                  overflow: "hidden",
                  position: "relative",
               }}
            >
               {/* Traffic light dots */}
               <div
                  aria-hidden
                  style={{
                     display: "flex",
                     gap: 4,
                     marginRight: 8,
                     flexShrink: 0,
                  }}
               >
                  {[0, 1, 2].map((i) => (
                     <motion.div
                        key={i}
                        style={DOT_STYLE}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                           isInView
                              ? { scale: 1, opacity: 1 }
                              : { scale: 0, opacity: 0 }
                        }
                        transition={{
                           delay: DOTS_DELAY + i * DOTS_STAGGER,
                           duration: DURATION.default,
                           ease: EASING.cinematic,
                        }}
                     />
                  ))}
               </div>

               {/* Path breadcrumb with staggered reveal */}
               {path.map((segment, i) => (
                  <motion.span
                     key={segment}
                     style={{ display: "contents" }}
                     initial={{ opacity: 0 }}
                     animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                     transition={{
                        delay: PATH_DELAY + i * PATH_STAGGER,
                        duration: DURATION.default,
                        ease: EASING.cinematic,
                     }}
                  >
                     {i > 0 && (
                        <span
                           style={{
                              fontFamily: MONO_FONT,
                              fontSize: 11,
                              color: TEXT_MUTED,
                              flexShrink: 0,
                           }}
                        >
                           /
                        </span>
                     )}
                     <span
                        style={{
                           fontFamily: MONO_FONT,
                           fontSize: 12,
                           color:
                              i === path.length - 1
                                 ? "rgb(var(--ch-white) / 0.5)"
                                 : TEXT_MUTED,
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           minWidth: 0,
                        }}
                     >
                        {segment}
                     </span>
                  </motion.span>
               ))}

               <div style={{ flex: 1, minWidth: 0 }} />

               {/* Activity level indicator with staggered pop */}
               <div
                  aria-hidden
                  style={{ display: "flex", gap: 3, flexShrink: 0 }}
               >
                  {[0.06, 0.12, 0.25, 0.45].map((opacity, i) => (
                     <motion.div
                        key={opacity}
                        style={{
                           width: 8,
                           height: 8,
                           borderRadius: 4,
                           background: `rgb(var(--ch-cyan) / ${opacity})`,
                        }}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{
                           delay: ACTIVITY_DELAY + i * ACTIVITY_STAGGER,
                           duration: DURATION.default,
                           ease: EASING.cinematic,
                        }}
                     />
                  ))}
               </div>
            </div>

            {/* Content area with fade-up */}
            <motion.div
               style={{
                  position: "relative",
                  padding: "20px 16px 40px",
                  maxWidth: "100%",
               }}
               initial={CONTENT_HIDDEN}
               animate={isInView ? CONTENT_VISIBLE : CONTENT_HIDDEN}
               transition={{
                  delay: CONTENT_DELAY,
                  duration: DURATION.slow,
                  ease: EASING.cinematic,
               }}
            >
               {children}
            </motion.div>
         </motion.div>
      </div>
   );
};

export default BrowserMockup;
