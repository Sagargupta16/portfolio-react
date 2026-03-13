import { motion } from "motion/react";

interface NeuralNetAnimProps {
   color: string;
}

const LAYERS = [
   [
      { x: 12, y: 26 },
      { x: 12, y: 50 },
   ],
   [
      { x: 36, y: 16 },
      { x: 36, y: 38 },
      { x: 36, y: 60 },
   ],
   [
      { x: 60, y: 26 },
      { x: 60, y: 50 },
   ],
];

const NODE_R = 4;

const NeuralNetAnim = ({ color }: NeuralNetAnimProps) => {
   const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      delay: number;
   }> = [];

   let idx = 0;
   for (let l = 0; l < LAYERS.length - 1; l++) {
      for (const from of LAYERS[l]) {
         for (const to of LAYERS[l + 1]) {
            connections.push({ from, to, delay: idx * 0.1 });
            idx++;
         }
      }
   }

   return (
      <div style={{ width: 80, height: 80, position: "relative" }}>
         {/* Connection lines */}
         {connections.map((c) => {
            const dx = c.to.x - c.from.x;
            const dy = c.to.y - c.from.y;
            const length = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
               <motion.div
                  key={`${c.from.x}-${c.from.y}-${c.to.x}-${c.to.y}`}
                  animate={{ opacity: [0.06, 0.4, 0.06] }}
                  transition={{
                     duration: 2,
                     delay: c.delay,
                     repeat: Infinity,
                     ease: "easeInOut",
                  }}
                  style={{
                     position: "absolute",
                     left: c.from.x,
                     top: c.from.y,
                     width: length,
                     height: 1,
                     background: color,
                     transformOrigin: "0 50%",
                     transform: `rotate(${angle}deg)`,
                  }}
               />
            );
         })}

         {/* Nodes */}
         {LAYERS.flat().map((node, i) => (
            <motion.div
               key={`${node.x}-${node.y}`}
               animate={{ scale: [1, 1.3, 1] }}
               transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
               }}
               style={{
                  position: "absolute",
                  left: node.x - NODE_R,
                  top: node.y - NODE_R,
                  width: NODE_R * 2,
                  height: NODE_R * 2,
                  borderRadius: "50%",
                  background: `${color}25`,
                  border: `1px solid ${color}`,
               }}
            />
         ))}
      </div>
   );
};

export default NeuralNetAnim;
