import { useMemo } from "react";
import { motion } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import { cryptoRandom } from "@utils/random";

interface Streak {
   id: number;
   startX: number;
   startY: number;
   angle: number;
   width: number;
   speed: number;
   delay: number;
   opacity: number;
   repeatDelay: number;
}

const STREAK_COUNT = 10;

const generateStreaks = (): Streak[] =>
   Array.from({ length: STREAK_COUNT }, (_, i) => ({
      id: i,
      startX: -10 + cryptoRandom() * 60,
      startY: cryptoRandom() * 70,
      angle: -(30 + cryptoRandom() * 30),
      width: 100 + cryptoRandom() * 120,
      speed: 1.2 + cryptoRandom() * 1.8,
      delay: cryptoRandom() * 10,
      opacity: 0.15 + cryptoRandom() * 0.15,
      repeatDelay: 6 + cryptoRandom() * 8,
   }));

const ShootingStars = () => {
   const reducedMotion = useReducedMotion();
   const streaks = useMemo(() => generateStreaks(), []);

   if (reducedMotion) return null;

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
         {streaks.map((s) => {
            const rad = (s.angle * Math.PI) / 180;
            const travel = 1800;
            const dx = Math.cos(rad) * travel;
            const dy = Math.sin(rad) * travel;

            return (
               <motion.div
                  key={s.id}
                  style={{
                     position: "absolute",
                     left: `${s.startX}%`,
                     top: `${s.startY}%`,
                     width: s.width,
                     height: 1.5,
                     borderRadius: 2,
                     background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.8) 60%, transparent 100%)",
                     boxShadow: "0 0 6px 1px rgba(6, 182, 212, 0.3)",
                     transform: `rotate(${s.angle}deg)`,
                     transformOrigin: "0 50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                     x: [0, dx],
                     y: [0, dy],
                     opacity: [0, s.opacity, s.opacity, 0],
                  }}
                  transition={{
                     duration: s.speed,
                     delay: s.delay,
                     repeat: Infinity,
                     repeatDelay: s.repeatDelay,
                     ease: "linear",
                  }}
               />
            );
         })}
      </div>
   );
};

export default ShootingStars;
