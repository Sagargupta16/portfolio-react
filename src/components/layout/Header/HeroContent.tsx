import { lazy, Suspense, useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, Download, FileText } from "lucide-react";
import { getHeadline, getIntro, getName, getRoleLabel } from "@data/personal";
import { CYAN, GREEN, MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import ErrorBoundary from "@components/common/ErrorBoundary";
import CvViewerModal from "@components/ui/CvViewerModal/CvViewerModal";
import useBreakpoint from "@hooks/useBreakpoint";
import useSectionNavigation from "@hooks/useSectionNavigation";
import HeroSocial from "./HeroSocial";
import {
   HEADLINE_MASK_STYLE,
   heroContainer,
   heroHeadline,
   heroHeadlineLine,
   heroIntro,
   heroLabel,
   heroLogo,
   heroRow,
   passThroughTransform,
} from "./heroMotion";

const HeroLatest = lazy(() => import("./HeroLatest"));
const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";
const NBSP = "\u00A0";
const CTA_TAP = { scale: 0.97 };

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

   const { navigateToSection } = useSectionNavigation();

   return (
      <motion.div
         // Bottom padding is larger than top: it reserves a lane for the absolute
         // scroll indicator so it never overlaps the social icons. Sized so the
         // hero still fits one desktop viewport (~800px) with the intro in place.
         className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-28 md:pt-20 md:pb-24 gap-6 max-w-4xl mx-auto"
         variants={heroContainer}
         initial="hidden"
         animate="visible"
      >
         {/* Logo tile (akobir-style mark above the headline) */}
         <motion.div variants={heroLogo}>
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
         <motion.div variants={heroLabel}>
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
             hierarchy (both lines equally bright read flat). Each line slides
             up out of its own clipping wrapper; see HEADLINE_MASK_STYLE. */}
         <motion.h1
            className="display-heading text-5xl sm:text-6xl md:text-7xl leading-[1.12] text-text-primary"
            variants={heroHeadline}
         >
            <span style={HEADLINE_MASK_STYLE}>
               <motion.span className="block" variants={heroHeadlineLine}>
                  Hi, I&apos;m <span style={{ color: CYAN }}>{name}</span>.
               </motion.span>
            </span>
            <span style={HEADLINE_MASK_STYLE}>
               <motion.span
                  className="block text-text-secondary"
                  variants={heroHeadlineLine}
               >
                  {headline}
               </motion.span>
            </span>
         </motion.h1>

         {/* Intro: what to hire him for, in two sentences. Replaces the old
             cycling role labels, which said nothing specific. */}
         <motion.p
            className="text-base md:text-lg"
            style={{ color: TEXT_SECONDARY, maxWidth: 680, lineHeight: 1.6 }}
            variants={heroIntro}
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

         {/* CTA buttons. The .btn-* stylesheet owns the hover lift; Motion only
             writes transform during the press (see passThroughTransform). */}
         <motion.div
            className="grid w-full max-w-sm grid-cols-2 items-center gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-4"
            variants={heroRow}
         >
            <motion.button
               onClick={() => navigateToSection("projects")}
               className="btn-primary col-span-2 inline-flex items-center justify-center gap-2 text-sm sm:col-span-1"
               whileTap={CTA_TAP}
               transformTemplate={passThroughTransform}
            >
               Explore Projects
               <ArrowDownRight size={16} aria-hidden="true" />
            </motion.button>
            <motion.button
               onClick={() => setCvOpen(true)}
               className="btn-outline inline-flex items-center justify-center gap-2 text-sm font-semibold"
               whileTap={CTA_TAP}
               transformTemplate={passThroughTransform}
               aria-haspopup="dialog"
            >
               <FileText size={15} aria-hidden="true" />
               View CV
            </motion.button>
            <motion.a
               href={RESUME_URL}
               download
               className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
               whileTap={CTA_TAP}
               transformTemplate={passThroughTransform}
            >
               <Download size={15} aria-hidden="true" />
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
