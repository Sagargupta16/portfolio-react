import { useCallback } from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { ChevronDown } from "lucide-react";
import HeroContent from "./HeroContent";

const Hero = () => {
   const lenis = useLenis();
   const scrollToAbout = useCallback(() => {
      const el = document.getElementById("about");
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -64 });
      else el.scrollIntoView();
   }, [lenis]);

   return (
      <section
         id="hero"
         className="relative min-h-screen overflow-hidden flex items-center justify-center"
      >
         {/* Dot texture comes from the site-wide AmbientBackground */}
         <HeroContent />

         {/* Scroll indicator */}
         <motion.button
            onClick={scrollToAbout}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
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
