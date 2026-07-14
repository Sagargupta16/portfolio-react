import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Unity 2D game covers: pacman | minesweeper | snake | flappy. */

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1.2,
   textTransform: "uppercase",
};

const Pacman = ({ tint }: { tint: string }) => (
   <>
      {/* Corridor dots -- eaten as the chomper passes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
         <motion.span
            key={i}
            animate={{ opacity: [0.7, 0.7, 0, 0, 0.7] }}
            transition={{
               duration: 5,
               repeat: Infinity,
               times: [0, i * 0.13 + 0.05, i * 0.13 + 0.1, 0.92, 1],
            }}
            style={{
               position: "absolute",
               left: `${22 + i * 11}%`,
               top: "48%",
               width: 5,
               height: 5,
               borderRadius: "50%",
               background: "rgba(255,255,255,0.35)",
            }}
         />
      ))}
      {/* Chomper: circle with animated wedge mouth via conic-gradient rotation */}
      <motion.div
         animate={{ x: [0, 240] }}
         transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
         style={{ position: "absolute", left: "10%", top: "43%" }}
      >
         <motion.div
            animate={{ rotate: [0, 0] }}
            style={{
               width: 26,
               height: 26,
               borderRadius: "50%",
               background: tint,
               position: "relative",
               overflow: "hidden",
            }}
         >
            {/* Mouth: dark wedge opening/closing */}
            <motion.div
               animate={{ scaleY: [1, 0.1, 1] }}
               transition={{ duration: 0.45, repeat: Infinity }}
               style={{
                  position: "absolute",
                  right: -2,
                  top: "50%",
                  width: "55%",
                  height: "46%",
                  marginTop: "-23%",
                  background: "#0b1012",
                  clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
               }}
            />
         </motion.div>
      </motion.div>
      {/* Ghost following */}
      <motion.div
         animate={{ x: [0, 240], y: [0, -3, 0, 3, 0] }}
         transition={{
            x: { duration: 5, repeat: Infinity, ease: "linear", delay: 0.5 },
            y: { duration: 1.2, repeat: Infinity },
         }}
         style={{
            position: "absolute",
            left: "1%",
            top: "44%",
            width: 22,
            height: 24,
            borderRadius: "11px 11px 3px 3px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.06)",
         }}
      >
         <span
            style={{
               position: "absolute",
               left: 5,
               top: 7,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: "rgba(255,255,255,0.7)",
            }}
         />
         <span
            style={{
               position: "absolute",
               right: 5,
               top: 7,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: "rgba(255,255,255,0.7)",
            }}
         />
      </motion.div>
   </>
);

const Minesweeper = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "50%",
         transform: "translate(-50%, -52%)",
         display: "grid",
         gridTemplateColumns: "repeat(4, 22px)",
         gap: 4,
      }}
   >
      {Array.from({ length: 16 }, (_, i) => {
         const isMine = i === 9;
         const isDigit = i === 6;
         return (
            <motion.div
               key={i}
               animate={{
                  scale: [1, 1, 0.85, 1],
                  opacity: [0.9, 0.9, 0.4, isMine || isDigit ? 1 : 0.25],
               }}
               transition={{
                  duration: 6,
                  repeat: Infinity,
                  times: [0, 0.04 * i + 0.1, 0.04 * i + 0.14, 0.04 * i + 0.2],
               }}
               style={{
                  width: 22,
                  height: 22,
                  borderRadius: 3,
                  border: `1px solid ${isMine ? `${tint}70` : "rgba(255,255,255,0.14)"}`,
                  background: isMine ? `${tint}12` : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               {isMine && (
                  <motion.span
                     animate={{ scale: [0.6, 1.1, 0.6] }}
                     transition={{ duration: 1.6, repeat: Infinity }}
                     style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: tint,
                     }}
                  />
               )}
               {isDigit && (
                  <span style={{ ...label, fontSize: 9, color: "#22c55e" }}>2</span>
               )}
            </motion.div>
         );
      })}
   </div>
);

const SNAKE_PATH = [
   { x: 0, y: 0 },
   { x: 44, y: 0 },
   { x: 44, y: 34 },
   { x: 100, y: 34 },
   { x: 100, y: 0 },
];

const Snake = ({ tint }: { tint: string }) => (
   <>
      {/* Grid hairlines */}
      <div
         style={{
            position: "absolute",
            inset: "12%",
            backgroundImage:
               "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
         }}
      />
      {/* Snake segments follow an L path with stagger */}
      {[0, 1, 2, 3, 4].map((seg) => (
         <motion.span
            key={seg}
            animate={{
               x: SNAKE_PATH.map((p) => p.x),
               y: SNAKE_PATH.map((p) => p.y),
            }}
            transition={{
               duration: 4,
               repeat: Infinity,
               delay: seg * 0.14,
               ease: "linear",
            }}
            style={{
               position: "absolute",
               left: "24%",
               top: "34%",
               width: 13,
               height: 13,
               borderRadius: 4,
               background: seg === 0 ? tint : `${tint}${["cc", "aa", "77", "44"][seg - 1]}`,
            }}
         />
      ))}
      {/* Food dot */}
      <motion.span
         animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
         transition={{ duration: 1.4, repeat: Infinity }}
         style={{
            position: "absolute",
            left: "72%",
            top: "60%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
         }}
      />
   </>
);

const Flappy = ({ tint }: { tint: string }) => (
   <>
      {/* Pipe pairs sweeping right to left */}
      {[0, 1, 2].map((i) => (
         <motion.div
            key={i}
            animate={{ x: [340, -60] }}
            transition={{
               duration: 4.5,
               repeat: Infinity,
               delay: i * 1.5,
               ease: "linear",
            }}
            style={{ position: "absolute", left: 0, top: 0, height: "100%" }}
         >
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  width: 26,
                  height: `${26 + (i % 2) * 12}%`,
                  borderRadius: "0 0 4px 4px",
                  border: "1px solid #22c55e40",
                  background: "#22c55e0a",
               }}
            />
            <div
               style={{
                  position: "absolute",
                  bottom: 0,
                  width: 26,
                  height: `${34 - (i % 2) * 12}%`,
                  borderRadius: "4px 4px 0 0",
                  border: "1px solid #22c55e40",
                  background: "#22c55e0a",
               }}
            />
         </motion.div>
      ))}
      {/* Bird */}
      <motion.div
         animate={{ y: [0, -16, 4, -12, 0], rotate: [0, -12, 8, -10, 0] }}
         transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
         style={{
            position: "absolute",
            left: "30%",
            top: "44%",
            width: 18,
            height: 14,
            borderRadius: "6px 8px 6px 4px",
            background: tint,
         }}
      >
         <span
            style={{
               position: "absolute",
               right: 3,
               top: 3,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: "#0b1012",
            }}
         />
      </motion.div>
   </>
);

const GameScene = ({ tint, variant = "pacman" }: CoverSceneProps) => {
   let scene: React.ReactNode;
   if (variant === "minesweeper") scene = <Minesweeper tint={tint} />;
   else if (variant === "snake") scene = <Snake tint={tint} />;
   else if (variant === "flappy") scene = <Flappy tint={tint} />;
   else scene = <Pacman tint={tint} />;

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
         {scene}
         <span
            style={{
               ...label,
               position: "absolute",
               right: "5%",
               bottom: "7%",
               color: "rgba(255,255,255,0.35)",
            }}
         >
            Unity 2D
         </span>
      </div>
   );
};

export default GameScene;
