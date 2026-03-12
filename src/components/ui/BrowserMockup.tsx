import type { ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MONO_FONT, TEXT_MUTED } from "@/constants/theme";

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

const BrowserMockup = ({
   children,
   path = ["sagargupta16", "contributions"],
   tiltDeg = 48,
}: BrowserMockupProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -100px 0px",
   });

   return (
      <div
         ref={ref}
         style={{
            perspective: "min(1400px, 100vw)",
            perspectiveOrigin: "50% 40%",
         }}
      >
         <motion.div
            initial={{ rotateX: tiltDeg + 15, opacity: 0, scale: 0.9, y: 40 }}
            animate={
               isInView
                  ? { rotateX: tiltDeg, opacity: 1, scale: 1, y: 0 }
                  : { rotateX: tiltDeg + 15, opacity: 0, scale: 0.9, y: 40 }
            }
            transition={{
               duration: 1,
               ease: [0.16, 1, 0.3, 1],
            }}
            style={{
               transformOrigin: "50% 2%",
               borderRadius: 14,
               overflow: "hidden",
               border: "1px solid rgb(var(--ch-white) / 0.08)",
               background: "rgb(var(--ch-glass) / 0.5)",
               backdropFilter: "blur(20px)",
               WebkitBackdropFilter: "blur(20px)",
               boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  0 0 120px rgb(var(--ch-cyan) / 0.06),
                  inset 0 1px 0 rgb(var(--ch-white) / 0.04)
               `,
               maskImage:
                  "linear-gradient(black 50%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)",
               WebkitMaskImage:
                  "linear-gradient(black 50%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)",
            }}
         >
            {/* Animated glow border on top edge */}
            <motion.div
               initial={{ scaleX: 0, opacity: 0 }}
               animate={
                  isInView
                     ? { scaleX: 1, opacity: 1 }
                     : { scaleX: 0, opacity: 0 }
               }
               transition={{
                  duration: 1.2,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
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
                  height: 40,
                  background: "rgb(var(--ch-bg-sec) / 0.8)",
                  borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  gap: 6,
                  overflow: "hidden",
                  position: "relative",
               }}
            >
               {/* Traffic light dots */}
               <div
                  style={{
                     display: "flex",
                     gap: 6,
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
                        transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                     />
                  ))}
               </div>

               {/* Path breadcrumb with typewriter reveal */}
               {path.map((segment, i) => (
                  <motion.span
                     key={segment}
                     style={{ display: "contents" }}
                     initial={{ opacity: 0 }}
                     animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                     transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
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

               {/* Activity level indicator with staggered fade */}
               <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  {[0.06, 0.12, 0.25, 0.45].map((opacity, i) => (
                     <motion.div
                        key={opacity}
                        style={{
                           width: 8,
                           height: 8,
                           borderRadius: 2,
                           background: `rgb(var(--ch-cyan) / ${opacity})`,
                        }}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                     />
                  ))}
               </div>
            </div>

            {/* Content area with fade-up */}
            <motion.div
               style={{ position: "relative", padding: "24px 40px 48px" }}
               initial={{ opacity: 0, y: 20 }}
               animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
               transition={{
                  delay: 0.5,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
               }}
            >
               {children}
            </motion.div>
         </motion.div>
      </div>
   );
};

export default BrowserMockup;
