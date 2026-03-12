import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getName, getRoles } from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import HeroStats from "./HeroStats";
import HeroSocial from "./HeroSocial";
import Resume from "@assets/Resume.pdf";

const HeroContent = () => {
   const [roleIndex, setRoleIndex] = useState(0);

   const name = useMemo(() => getName(), []);
   const roles = useMemo(() => getRoles(), []);

   useEffect(() => {
      const interval = setInterval(() => {
         setRoleIndex((prev) => (prev + 1) % roles.length);
      }, 3000);
      return () => clearInterval(interval);
   }, [roles]);

   const scrollToProjects = useCallback(() => {
      const el = document.querySelector("#projects");
      if (el) el.scrollIntoView({ behavior: "smooth" });
   }, []);

   return (
      <motion.div
         className="relative z-10 flex flex-col items-center text-center px-6 py-32 gap-7 max-w-4xl mx-auto"
         variants={staggerContainer}
         initial="hidden"
         animate="visible"
      >
         {/* Terminal badge */}
         <motion.div variants={staggerItem}>
            <span
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: MONO_FONT,
                  fontSize: 14,
                  color: "#22c55e",
                  background: "rgba(34, 197, 94, 0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(34, 197, 94, 0.12)",
                  borderRadius: 9999,
                  padding: "6px 16px",
               }}
            >
               <span className="w-2 h-2 rounded-full bg-accent-green animate-glow-pulse" />
               {"// Cloud Consultant \u2014 DevOps/MLOps @ AWS"}
               <span className="animate-blink">|</span>
            </span>
         </motion.div>

         {/* Heading */}
         <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
            variants={staggerItem}
         >
            <span className="text-text-primary">Hi, I&apos;m </span>
            <span className="gradient-text-vivid">{name}</span>
         </motion.h1>

         {/* Animated role cycling */}
         <motion.div
            className="h-9 md:h-11 flex items-center justify-center"
            variants={staggerItem}
         >
            <AnimatePresence mode="wait">
               <motion.p
                  key={roleIndex}
                  className="font-mono text-base md:text-xl text-accent-purple"
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
               >
                  {roles[roleIndex]}
               </motion.p>
            </AnimatePresence>
         </motion.div>

         {/* Stats row */}
         <HeroStats />

         {/* CTA buttons */}
         <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-4"
            variants={staggerItem}
         >
            <motion.button
               onClick={scrollToProjects}
               className="btn-primary text-sm font-semibold"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               View Projects
            </motion.button>
            <motion.a
               href={Resume}
               download
               className="btn-outline text-sm"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               Download Resume
            </motion.a>
         </motion.div>

         {/* Status widget + Social icons */}
         <HeroSocial />
      </motion.div>
   );
};

export default HeroContent;
