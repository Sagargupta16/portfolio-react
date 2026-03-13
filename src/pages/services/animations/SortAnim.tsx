import { motion } from "motion/react";
import { CYAN, PURPLE, GREEN, AMBER, PINK } from "@/constants/theme";

interface SortAnimProps {
   color: string;
}

const BARS = [
   { h: 50, color: CYAN },
   { h: 20, color: PURPLE },
   { h: 40, color: GREEN },
   { h: 10, color: AMBER },
   { h: 30, color: PINK },
];

const BAR_W = 8;
const GAP = 6;
const BASE_Y = 72;
const START_X = 6;

// Bubble sort frames: FRAME[position] = barIndex
// Heights by bar: 0=50, 1=20, 2=40, 3=10, 4=30
// Sorted: 10(3), 20(1), 30(4), 40(2), 50(0)
const FRAMES = [
   [0, 1, 2, 3, 4], // 50 20 40 10 30
   [1, 0, 2, 3, 4], // 20 50 40 10 30
   [1, 2, 0, 3, 4], // 20 40 50 10 30
   [1, 2, 3, 0, 4], // 20 40 10 50 30
   [1, 2, 3, 4, 0], // 20 40 10 30 50
   [1, 3, 2, 4, 0], // 20 10 40 30 50
   [1, 3, 4, 2, 0], // 20 10 30 40 50
   [3, 1, 4, 2, 0], // 10 20 30 40 50 sorted!
];

const getX = (pos: number) => START_X + pos * (BAR_W + GAP);

const SortAnim = ({ color }: SortAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      {BARS.map((bar, barIdx) => {
         const leftValues = FRAMES.map((frame) => getX(frame.indexOf(barIdx)));

         return (
            <motion.div
               key={`bar-${bar.h}`}
               animate={{ left: leftValues }}
               transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut",
                  times: FRAMES.map((_, i) => i / (FRAMES.length - 1)),
               }}
               style={{
                  position: "absolute",
                  top: BASE_Y - bar.h,
                  width: BAR_W,
                  height: bar.h,
                  borderRadius: 3,
                  background: `${bar.color}35`,
                  borderTop: `2px solid ${bar.color}`,
               }}
            />
         );
      })}

      {/* Base line */}
      <div
         style={{
            position: "absolute",
            left: 4,
            top: BASE_Y + 2,
            right: 4,
            height: 1,
            background: `${color}15`,
         }}
      />
   </div>
);

export default SortAnim;
