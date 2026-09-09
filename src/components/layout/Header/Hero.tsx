import { lazy, Suspense, useRef } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import useSectionNavigation from "@hooks/useSectionNavigation";
import HeroContent from "./HeroContent";

const HeroStackField = lazy(() => import("./HeroStackField"));

/* Truthy on purpose: ErrorBoundary treats a falsy fallback as "not provided"
   and renders its full "Something went wrong" panel. A failed field chunk
   should leave the flanks empty, not replace the hero. */
const OMIT_FIELD = <></>;

const Hero = () => {
   const sectionRef = useRef<HTMLElement>(null);
   const { navigateToSection } = useSectionNavigation();

   return (
      <section
         ref={sectionRef}
         id="hero"
         tabIndex={-1}
         // Top-aligned on phones: the content is taller than the viewport there,
         // and centering it would push the logo under the fixed nav and the
         // socials into the scroll indicator's lane. HeroContent's pt/pb padding
         // reserves both lanes once the section is allowed to grow.
         className="relative min-h-dvh overflow-hidden flex items-start md:items-center justify-center"
      >
         {/* Dot texture comes from the site-wide AmbientBackground */}
         <HeroContent />

         {/* Floating stack field for phones and tablets (StackFieldBackdrop
             owns the flanks from 1280px up): after the copy in DOM order so
             the headline paints first, under it visually (z-0 beneath
             HeroContent's z-10). Lazy so the skill glyph registry stays out
             of the entry bundle. */}
         <ErrorBoundary fallback={OMIT_FIELD}>
            <Suspense fallback={null}>
               <HeroStackField hostRef={sectionRef} />
            </Suspense>
         </ErrorBoundary>

         {/* Scroll indicator */}
         <motion.button
            onClick={() => navigateToSection("about")}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
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
