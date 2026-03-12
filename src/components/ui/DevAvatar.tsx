import { motion } from "motion/react";
import { orbitItems, floatVariant } from "./devAvatarData";
import AvatarMonogram from "./AvatarMonogram";

const DevAvatar = () => {
   const size = 320;
   const center = size / 2;
   const orbitRadius = 130;

   return (
      <div
         style={{
            width: size,
            height: size,
            position: "relative",
            margin: "0 auto",
         }}
      >
         {/* Outer glow ring */}
         <motion.div
            style={{
               position: "absolute",
               inset: 10,
               borderRadius: "50%",
               background:
                  "conic-gradient(from 0deg, #06b6d4, #a855f7, #22c55e, #06b6d4)",
               opacity: 0.15,
               filter: "blur(20px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
         />

         {/* Rotating gradient border */}
         <motion.div
            style={{
               position: "absolute",
               inset: 30,
               borderRadius: "50%",
               padding: 2,
               background:
                  "conic-gradient(from 0deg, #06b6d4, transparent 40%, #a855f7, transparent 80%, #06b6d4)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
         >
            <div
               style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "rgba(10, 10, 20, 0.8)",
                  backdropFilter: "blur(8px)",
               }}
            />
         </motion.div>

         {/* Inner circle with monogram */}
         <AvatarMonogram />

         {/* Dashed orbit ring */}
         <svg
            style={{
               position: "absolute",
               inset: 0,
               width: size,
               height: size,
            }}
            viewBox={`0 0 ${size} ${size}`}
         >
            <circle
               cx={center}
               cy={center}
               r={orbitRadius}
               fill="none"
               stroke="rgba(255,255,255,0.06)"
               strokeWidth="1"
               strokeDasharray="4 6"
            />
         </svg>

         {/* Orbiting icons */}
         {orbitItems.map(({ Icon, color, delay, angle }) => {
            const rad = (angle * Math.PI) / 180;
            const x = center + orbitRadius * Math.cos(rad) - 18;
            const y = center + orbitRadius * Math.sin(rad) - 18;

            return (
               <motion.div
                  key={angle}
                  style={{
                     position: "absolute",
                     left: x,
                     top: y,
                     width: 36,
                     height: 36,
                     borderRadius: 10,
                     background: `${color}0d`,
                     backdropFilter: "blur(8px)",
                     border: `1px solid ${color}18`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate="animate"
                  variants={floatVariant(delay)}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{}}
                  transition={{ duration: 0.5, delay: delay * 0.3 }}
               >
                  <Icon style={{ width: 16, height: 16, color }} />
               </motion.div>
            );
         })}
      </div>
   );
};

export default DevAvatar;
