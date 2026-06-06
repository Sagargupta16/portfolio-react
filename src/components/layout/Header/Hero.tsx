import { useCallback } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import HeroContent from "./HeroContent";

const Hero = () => {
   const scrollToAbout = useCallback(() => {
      const el = document.querySelector("#about");
      if (el) el.scrollIntoView({ behavior: "smooth" });
   }, []);

   return (
      <section
         id="hero"
         className="relative min-h-screen overflow-hidden flex items-center justify-center"
      >
         {/* Gradient overlays */}
         <div
            className="absolute inset-0"
            style={{
               background:
                  "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)",
            }}
         />
         <div className="absolute inset-0 grid-bg" />
         <div
            className="absolute"
            style={{
               top: "10%",
               left: "20%",
               width: 500,
               height: 500,
               background:
                  "radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 70%)",
               borderRadius: "50%",
               filter: "blur(60px)",
            }}
         />
         <div
            className="absolute"
            style={{
               bottom: "10%",
               right: "10%",
               width: 400,
               height: 400,
               background:
                  "radial-gradient(circle, rgba(168, 85, 247, 0.06), transparent 70%)",
               borderRadius: "50%",
               filter: "blur(60px)",
            }}
         />

         {/* Content (3D background is now global -- see App.tsx SceneBackground) */}
         <HeroContent />

         {/* Scroll indicator */}
         <motion.button
            onClick={scrollToAbout}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            aria-label="Scroll to About section"
         >
            <span className="text-xs font-mono tracking-widest uppercase">
               Scroll
            </span>
            <ChevronDown className="w-5 h-5 animate-scroll-hint" />
         </motion.button>
      </section>
   );
};

export default Hero;
