import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { getName, getRoles } from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import { GREEN, TEXT_SECONDARY } from "@/constants/theme";
import HeroStats from "./HeroStats";
import HeroSocial from "./HeroSocial";
const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

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

   const lenis = useLenis();
   const scrollToProjects = useCallback(() => {
      const el = document.getElementById("projects");
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -64 });
      else el.scrollIntoView();
   }, [lenis]);

   return (
      <motion.div
         className="relative z-10 flex flex-col items-center text-center px-6 py-32 gap-7 max-w-4xl mx-auto"
         variants={staggerContainer}
         initial="hidden"
         animate="visible"
      >
         {/* Logo tile (akobir-style mark above the headline) */}
         <motion.div variants={staggerItem}>
            <div
               style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#0b1012",
                  background: "#67e8f9",
               }}
               aria-hidden="true"
            >
               SG
            </div>
         </motion.div>

         {/* Status badge */}
         <motion.div variants={staggerItem}>
            <span className="badge-pill">
               <span
                  className="animate-glow-pulse"
                  style={{
                     width: 8,
                     height: 8,
                     borderRadius: "50%",
                     background: GREEN,
                     flexShrink: 0,
                  }}
               />
               DevOps/MLOps Consultant @ AWS
            </span>
         </motion.div>

         {/* Heading */}
         <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.15] tracking-tight text-text-primary"
            variants={staggerItem}
         >
            Hi, I&apos;m {name}.
            <br />
            Shipping cloud at scale.
         </motion.h1>

         {/* Animated role cycling */}
         <motion.div
            className="h-9 md:h-11 flex items-center justify-center"
            variants={staggerItem}
         >
            <AnimatePresence mode="wait">
               <motion.p
                  key={roleIndex}
                  className="text-base md:text-xl"
                  style={{ color: TEXT_SECONDARY }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
               >
                  {roles[roleIndex]}
               </motion.p>
            </AnimatePresence>
         </motion.div>

         {/* CTA buttons */}
         <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            variants={staggerItem}
         >
            <motion.button
               onClick={scrollToProjects}
               className="btn-outline text-sm font-semibold"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               Explore Projects
            </motion.button>
            <motion.a
               href={RESUME_URL}
               download
               className="btn-primary text-sm"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               Download CV
            </motion.a>
         </motion.div>

         {/* Stats row */}
         <HeroStats />

         {/* Status widget + Social icons */}
         <HeroSocial />
      </motion.div>
   );
};

export default HeroContent;
