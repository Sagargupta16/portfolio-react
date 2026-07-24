import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { FileText } from "lucide-react";
import { getName, getRoles } from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import { CYAN, GREEN, TEXT_SECONDARY } from "@/constants/theme";
import CvViewerModal from "@components/ui/CvViewerModal/CvViewerModal";
import HeroStats from "./HeroStats";
import HeroSocial from "./HeroSocial";
const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

const HeroContent = () => {
   const [roleIndex, setRoleIndex] = useState(0);
   const [cvOpen, setCvOpen] = useState(false);

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
         // Bottom padding is deliberately larger than top: it reserves a lane for
         // the absolute scroll indicator so it never overlaps the social icons.
         className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-36 gap-6 max-w-4xl mx-auto"
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
               <span>DevOps/MLOps Consultant @ AWS</span>
            </span>
         </motion.div>

         {/* Heading: display face, name in accent, second line dimmed for
             hierarchy (both lines equally bright read flat) */}
         <motion.h1
            className="display-heading text-5xl sm:text-6xl md:text-7xl leading-[1.12] text-text-primary"
            variants={staggerItem}
         >
            Hi, I&apos;m <span style={{ color: CYAN }}>{name}</span>.
            <br />
            <span style={{ color: "var(--color-text-secondary)" }}>
               Shipping cloud at scale.
            </span>
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
            <motion.button
               onClick={() => setCvOpen(true)}
               className="btn-outline text-sm font-semibold"
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
               }}
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
               aria-haspopup="dialog"
            >
               <FileText size={15} />
               View CV
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

         {/* In-site CV viewer (lazy: pdf.js loads only when opened) */}
         <CvViewerModal isOpen={cvOpen} onClose={() => setCvOpen(false)} />
      </motion.div>
   );
};

export default HeroContent;
