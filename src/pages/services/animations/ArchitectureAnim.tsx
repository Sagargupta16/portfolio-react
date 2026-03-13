import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface ArchitectureAnimProps {
   color: string;
}

const CX = 40;
const CY = 38;
const RADIUS = 24;

const SATELLITES = [
   { angle: -90, label: "VPC" },
   { angle: 30, label: "ECS" },
   { angle: 150, label: "S3" },
];

const ArchitectureAnim = ({ color }: ArchitectureAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      {/* Connection lines (dashed via repeated dots) */}
      {SATELLITES.map((sat) => {
         const rad = (sat.angle * Math.PI) / 180;
         const sx = CX + RADIUS * Math.cos(rad);
         const sy = CY + RADIUS * Math.sin(rad);
         const dx = sx - CX;
         const dy = sy - CY;
         const length = Math.hypot(dx, dy);
         const angle = Math.atan2(dy, dx) * (180 / Math.PI);
         return (
            <motion.div
               key={sat.label}
               animate={{ opacity: [0.12, 0.5, 0.12] }}
               transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
               }}
               style={{
                  position: "absolute",
                  left: CX,
                  top: CY,
                  width: length,
                  height: 1,
                  background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`,
                  transformOrigin: "0 50%",
                  transform: `rotate(${angle}deg)`,
               }}
            />
         );
      })}

      {/* Center node */}
      <motion.div
         animate={{ scale: [1, 1.08, 1] }}
         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
         style={{
            position: "absolute",
            left: CX - 10,
            top: CY - 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: `${color}20`,
            border: `1.5px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 6,
            fontFamily: MONO_FONT,
            fontWeight: 700,
            color,
         }}
      >
         AWS
      </motion.div>

      {/* Satellite nodes */}
      {SATELLITES.map((sat, i) => {
         const rad = (sat.angle * Math.PI) / 180;
         const sx = CX + RADIUS * Math.cos(rad);
         const sy = CY + RADIUS * Math.sin(rad);
         return (
            <motion.div
               key={sat.label}
               animate={{ y: [0, -2, 0] }}
               transition={{
                  duration: 2.5,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
               }}
               style={{
                  position: "absolute",
                  left: sx - 8,
                  top: sy - 8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: `${color}12`,
                  border: `1px solid ${color}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 5,
                  fontFamily: MONO_FONT,
                  fontWeight: 600,
                  color: `${color}cc`,
               }}
            >
               {sat.label}
            </motion.div>
         );
      })}

      {/* Pulse ring from center */}
      <motion.div
         animate={{ scale: [0.5, 2.5], opacity: [0.4, 0] }}
         transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
         style={{
            position: "absolute",
            left: CX - 10,
            top: CY - 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `0.5px solid ${color}`,
            pointerEvents: "none",
         }}
      />
   </div>
);

export default ArchitectureAnim;
