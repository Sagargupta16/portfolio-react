import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

const CYCLE = 6;

const label = (tint: string): React.CSSProperties => ({
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   color: `${tint}90`,
});

/* -- left: clock face with rotating minute hand -- */
const ClockFace = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "8%",
         top: "50%",
         transform: "translateY(-50%)",
      }}
   >
      <div
         style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `1px solid ${tint}35`,
            background: `${tint}06`,
            position: "relative",
         }}
      >
         {/* tick marks */}
         {[0, 90, 180, 270].map((deg) => (
            <div
               key={deg}
               style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 2,
                  height: 5,
                  background: `${tint}40`,
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-23px)`,
               }}
            />
         ))}
         {/* minute hand, 8s loop */}
         <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
         >
            <div
               style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 2,
                  height: 19,
                  borderRadius: 2,
                  background: "#60a5fa",
                  transformOrigin: "50% 100%",
                  transform: "translate(-50%, -100%)",
               }}
            />
         </motion.div>
         {/* hour hand, slow */}
         <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
         >
            <div
               style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 2,
                  height: 12,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.35)",
                  transformOrigin: "50% 100%",
                  transform: "translate(-50%, -100%)",
               }}
            />
         </motion.div>
         {/* center pin */}
         <div
            style={{
               position: "absolute",
               left: "50%",
               top: "50%",
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: "#60a5fa",
               transform: "translate(-50%, -50%)",
            }}
         />
      </div>
      <div style={{ ...label(tint), textAlign: "center", marginTop: 7 }}>
         CRON
      </div>
   </div>
);

/* -- middle: pipeline stage box -- */
const StageBox = ({
   tint,
   left,
   text,
   delay,
}: {
   tint: string;
   left: string;
   text: string;
   delay: number;
}) => (
   <div
      style={{
         position: "absolute",
         left,
         top: "50%",
         transform: "translateY(-50%)",
      }}
   >
      <motion.div
         animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.04, 1] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            delay,
            times: [0, 0.12, 0.3],
         }}
         style={{
            width: 46,
            height: 30,
            borderRadius: 6,
            border: `1px solid ${tint}35`,
            background: `${tint}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <span style={{ ...label(tint), color: "rgba(255,255,255,0.5)" }}>
            {text}
         </span>
      </motion.div>
   </div>
);

/* -- right: variant outputs -- */
const InstagramOut = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         right: "7%",
         top: "50%",
         transform: "translateY(-50%)",
      }}
   >
      <div
         style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            border: `1px solid ${tint}35`,
            background: `${tint}06`,
            position: "relative",
            overflow: "hidden",
         }}
      >
         {/* image placeholder shimmer */}
         <motion.div
            animate={{ x: [-60, 60] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            style={{
               position: "absolute",
               top: 6,
               left: 0,
               width: 30,
               height: 28,
               background:
                  "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)",
            }}
         />
         <div
            style={{
               position: "absolute",
               top: 6,
               left: 6,
               right: 6,
               height: 28,
               borderRadius: 3,
               background: "rgba(255,255,255,0.06)",
            }}
         />
         {/* heart dot pulsing */}
         <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
               position: "absolute",
               bottom: 7,
               left: 8,
               width: 5,
               height: 5,
               borderRadius: "50%",
               background: "#38bdf8",
            }}
         />
         <div
            style={{
               position: "absolute",
               bottom: 8,
               left: 18,
               width: 16,
               height: 3,
               borderRadius: 2,
               background: "rgba(255,255,255,0.14)",
            }}
         />
      </div>
      <div style={{ ...label(tint), textAlign: "center", marginTop: 7 }}>
         PUBLISH
      </div>
   </div>
);

const GitOut = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         right: "7%",
         top: "50%",
         transform: "translateY(-50%)",
      }}
   >
      <div style={{ width: 56, height: 52, position: "relative" }}>
         <div
            style={{
               position: "absolute",
               left: 7,
               top: 8,
               width: 40,
               height: 1,
               background: `${tint}30`,
            }}
         />
         {[0, 1].map((i) => (
            <div
               key={i}
               style={{
                  position: "absolute",
                  left: 4 + i * 20,
                  top: 5,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  border: `1px solid ${tint}60`,
                  background: `${tint}20`,
               }}
            />
         ))}
         {/* new commit popping in each cycle */}
         <motion.div
            animate={{ scale: [0, 1.25, 1, 1], opacity: [0, 1, 1, 1] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               delay: 3.4,
               times: [0, 0.08, 0.14, 1],
            }}
            style={{
               position: "absolute",
               left: 44,
               top: 5,
               width: 7,
               height: 7,
               borderRadius: "50%",
               background: "#60a5fa",
            }}
         />
         {/* branch line + node below */}
         <div
            style={{
               position: "absolute",
               left: 27,
               top: 12,
               width: 1,
               height: 14,
               background: `${tint}25`,
            }}
         />
         <div
            style={{
               position: "absolute",
               left: 24,
               top: 26,
               width: 7,
               height: 7,
               borderRadius: "50%",
               border: `1px solid ${tint}45`,
               background: `${tint}10`,
            }}
         />
      </div>
      <div style={{ ...label(tint), textAlign: "center", marginTop: 3 }}>
         HOOK
      </div>
   </div>
);

const BadgeOut = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         right: "8%",
         top: "50%",
         transform: "translateY(-50%)",
      }}
   >
      <motion.div
         animate={{ scale: [1.2, 1, 1, 1.2], opacity: [0, 1, 1, 0] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            delay: 3.4,
            times: [0, 0.08, 0.9, 1],
         }}
         style={{
            width: 44,
            height: 50,
            border: `1px solid ${tint}45`,
            background: `${tint}0c`,
            borderRadius: "8px 8px 50% 50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <div
            style={{
               width: 14,
               height: 8,
               borderLeft: "2px solid #60a5fa",
               borderBottom: "2px solid #60a5fa",
               transform: "rotate(-45deg) translateY(-2px)",
            }}
         />
      </motion.div>
      <div style={{ ...label(tint), textAlign: "center", marginTop: 7 }}>
         README
      </div>
   </div>
);

const OUTPUTS: Record<
   string,
   ({ tint }: { tint: string }) => React.JSX.Element
> = {
   git: GitOut,
   badge: BadgeOut,
   instagram: InstagramOut,
};

const AutomationScene = ({ tint, variant = "instagram" }: CoverSceneProps) => {
   const Output = OUTPUTS[variant] ?? InstagramOut;
   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         {/* tinted glow */}
         <div
            style={{
               position: "absolute",
               inset: 0,
               background: `radial-gradient(circle at 20% 45%, ${tint}14 0%, transparent 55%)`,
            }}
         />
         {/* dot-grid detail layer */}
         <div
            style={{
               position: "absolute",
               inset: 0,
               opacity: 0.06,
               backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
               backgroundSize: "22px 22px",
            }}
         />

         <ClockFace tint={tint} />

         {/* pipeline hairline from clock to output */}
         <div
            style={{
               position: "absolute",
               left: "24%",
               right: "22%",
               top: "50%",
               height: 1,
               background: `${tint}22`,
            }}
         />

         <StageBox tint={tint} left="34%" text="GEN" delay={1.2} />
         <StageBox tint={tint} left="52%" text="POST" delay={2.3} />

         {/* dot traveling the pipeline */}
         <motion.div
            animate={{ left: ["24%", "72%"], opacity: [0, 1, 1, 0] }}
            transition={{
               duration: CYCLE * 0.62,
               repeat: Infinity,
               repeatDelay: CYCLE * 0.38,
               ease: "easeInOut",
               times: [0, 0.1, 0.9, 1],
            }}
            style={{
               position: "absolute",
               top: "50%",
               width: 5,
               height: 5,
               marginTop: -2.5,
               borderRadius: "50%",
               background: "#60a5fa",
            }}
         />

         <Output tint={tint} />

         {/* green success dot blinking at cycle end */}
         <motion.div
            animate={{
               opacity: [0, 0, 1, 1, 0],
               scale: [0.6, 0.6, 1.3, 1, 0.6],
            }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.62, 0.68, 0.85, 1],
            }}
            style={{
               position: "absolute",
               right: "4%",
               top: "24%",
               width: 5,
               height: 5,
               borderRadius: "50%",
               background: "#22c55e",
               boxShadow: "0 0 6px #22c55e80",
            }}
         />
      </div>
   );
};

export default AutomationScene;
