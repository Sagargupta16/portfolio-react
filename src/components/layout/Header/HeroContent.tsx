import { lazy, Suspense, useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { FileText } from "lucide-react";
import { getHeadline, getIntro, getName, getRoleLabel } from "@data/personal";
import { staggerContainer, staggerItem } from "@utils/animations";
import { CYAN, GREEN, MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import ErrorBoundary from "@components/common/ErrorBoundary";
import CvViewerModal from "@components/ui/CvViewerModal/CvViewerModal";
import useBreakpoint from "@hooks/useBreakpoint";
import HeroSocial from "./HeroSocial";

const HeroLatest = lazy(() => import("./HeroLatest"));
const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";
const NBSP = "\u00A0";

/* Truthy on purpose: ErrorBoundary treats a falsy fallback as "not provided"
   and renders its full "Something went wrong" panel. A failed HeroLatest chunk
   should just drop the line, not replace the hero. */
const OMIT_LINE = <></>;

/* Holds the LATEST row's slot while its chunk loads so the CTAs and socials
   below do not jump when it arrives. Mirrors HeroLatest's layout and type
   metrics (mono label + one 14px/1.6 line) with blank content. */
const HeroLatestPlaceholder = () => {
   const { isMobile } = useBreakpoint();
   return (
      <div
         aria-hidden="true"
         style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "baseline",
            justifyContent: "center",
            gap: isMobile ? 4 : 14,
         }}
      >
         <span style={{ fontFamily: MONO_FONT, fontSize: 10 }}>{NBSP}</span>
         <span style={{ fontSize: 14, lineHeight: 1.6 }}>{NBSP}</span>
      </div>
   );
};

const HeroContent = () => {
   const [cvOpen, setCvOpen] = useState(false);

   const name = useMemo(() => getName(), []);
   const intro = useMemo(() => getIntro(), []);
   const roleLabel = useMemo(() => getRoleLabel(), []);
   const headline = useMemo(() => getHeadline(), []);

   const lenis = useLenis();
   const scrollToProjects = useCallback(() => {
      const el = document.getElementById("projects");
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -64 });
      else el.scrollIntoView();
   }, [lenis]);

   return (
      <motion.div
         // Bottom padding is larger than top: it reserves a lane for the absolute
         // scroll indicator so it never overlaps the social icons. Sized so the
         // hero still fits one desktop viewport (~800px) with the intro in place.
         className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-28 md:pt-20 md:pb-24 gap-6 max-w-4xl mx-auto"
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
               <span>{roleLabel}</span>
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
               {headline}
            </span>
         </motion.h1>

         {/* Intro: what to hire him for, in two sentences. Replaces the old
             cycling role labels, which said nothing specific. */}
         <motion.p
            className="text-base md:text-lg"
            style={{ color: TEXT_SECONDARY, maxWidth: 680, lineHeight: 1.6 }}
            variants={staggerItem}
         >
            {intro}
         </motion.p>

         {/* LATEST -- derived from data: newest merged PR + newest shipped project.
             Own boundary: a failed chunk omits the line instead of reaching the
             root ErrorBoundary and blanking the page. */}
         <ErrorBoundary fallback={OMIT_LINE}>
            <Suspense fallback={<HeroLatestPlaceholder />}>
               <HeroLatest />
            </Suspense>
         </ErrorBoundary>

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

         {/* Status widget + Social icons */}
         <HeroSocial />

         {/* In-site CV viewer (lazy: pdf.js loads only when opened) */}
         <CvViewerModal isOpen={cvOpen} onClose={() => setCvOpen(false)} />
      </motion.div>
   );
};

export default HeroContent;
