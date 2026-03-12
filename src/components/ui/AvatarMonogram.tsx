import { motion } from "motion/react";

const AvatarMonogram = () => {
   return (
      <div
         style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            background:
               "radial-gradient(circle at 30% 30%, rgba(18,18,42,0.9), rgba(10,10,20,0.85))",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 4,
         }}
      >
         <motion.span
            style={{
               fontSize: 56,
               fontWeight: 800,
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               background: "linear-gradient(135deg, #06b6d4, #a855f7)",
               WebkitBackgroundClip: "text",
               WebkitTextFillColor: "transparent",
               lineHeight: 1,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
         >
            SG
         </motion.span>
         <motion.span
            style={{
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               fontSize: 11,
               color: "#22c55e",
               letterSpacing: "0.1em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
               duration: 2,
               repeat: Infinity,
               ease: "easeInOut",
               delay: 0.8,
            }}
         >
            {"> dev"}
            <span style={{ color: "#06b6d4" }}>_</span>
         </motion.span>
      </div>
   );
};

export default AvatarMonogram;
