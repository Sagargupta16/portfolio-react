import { useMemo, useCallback, useState } from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { getName, getSocialProfiles } from "@data/personal";
import { staggerItem } from "@utils/animations";
import { EASING } from "@/constants/theme";
import { CONTENT_SECTIONS, type ContentSectionId } from "@/constants/sections";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import FooterSocial from "./FooterSocial";
import FooterStatusBar from "./FooterStatusBar";

const CURRENT_YEAR = new Date().getFullYear();
const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";
const LINK_COLOR = "rgba(244, 246, 247, 0.9)";

// The footer lists a subset of the section registry in registry order. Home
// targets the hero, which is not a registered content section.
const FOOTER_SECTION_IDS = new Set<ContentSectionId>([
   "projects",
   "stats",
   "contact",
]);
const SITE_LINKS: { id: string; label: string }[] = [
   { id: "hero", label: "Home" },
   ...CONTENT_SECTIONS.filter(({ id }) => FOOTER_SECTION_IDS.has(id)).map(
      ({ id, label }) => ({ id, label }),
   ),
];

/* Brand tile: one full turn per hover or keyboard focus. The turn count only
   ever grows, so each spin runs forward once and never unwinds on leave. */
const FULL_TURN_DEG = 360;
const SPIN_SPRING = { type: "spring", stiffness: 110, damping: 14 } as const;
const TILE_TAP = { scale: 0.94 };
const TILE_TRANSITION = {
   rotate: SPIN_SPRING,
   scale: { duration: 0.12, ease: EASING.brisk },
};

const columnHeading: React.CSSProperties = {
   fontSize: 12,
   fontWeight: 700,
   letterSpacing: "0.15em",
   textTransform: "uppercase",
   color: "#9ee8f2",
   marginBottom: 12,
};

/* .footer-link in the stylesheet draws the sliding underline on hover and
   keyboard focus; the colour stays put. */
const columnLink: React.CSSProperties = {
   display: "block",
   fontSize: 14,
   color: LINK_COLOR,
   padding: "4px 0",
   cursor: "pointer",
   background: "none",
   border: "none",
   textAlign: "left",
};

const FooterContent = () => {
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   const name = useMemo(() => getName(), []);
   const socialProfiles = useMemo(() => getSocialProfiles(), []);

   const [turns, setTurns] = useState(0);
   const spin = useCallback(() => setTurns((count) => count + 1), []);
   // Mouse clicks focus the button too; only keyboard focus earns a turn, or
   // a click would spin the tile twice.
   const spinOnKeyboardFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (e.currentTarget.matches(":focus-visible")) spin();
   };
   const spinTarget = reducedMotion
      ? undefined
      : { rotate: turns * FULL_TURN_DEG };

   const lenis = useLenis();
   const scrollTo = useCallback(
      (id: string) => {
         const el = document.getElementById(id);
         if (!el) return;
         if (lenis) lenis.scrollTo(el, { offset: -64 });
         else el.scrollIntoView();
      },
      [lenis],
   );

   return (
      <>
         {/* Top row: brand block + link columns */}
         <motion.div
            style={{
               display: "grid",
               gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto",
               gap: isMobile ? 32 : 80,
               alignItems: "start",
               width: "100%",
            }}
            variants={staggerItem}
         >
            {/* Brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <motion.button
                  type="button"
                  onClick={() => scrollTo("hero")}
                  onHoverStart={spin}
                  onFocus={spinOnKeyboardFocus}
                  whileTap={TILE_TAP}
                  animate={spinTarget}
                  transition={TILE_TRANSITION}
                  aria-label="Home"
                  style={{
                     width: 48,
                     height: 48,
                     borderRadius: 12,
                     border: "none",
                     cursor: "pointer",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     fontSize: 18,
                     fontWeight: 800,
                     color: "#0b1012",
                     background: "#67e8f9",
                  }}
               >
                  SG
               </motion.button>
               <p style={{ color: "rgba(244,246,247,0.8)", fontSize: 14 }}>
                  &copy; {CURRENT_YEAR} {name}. All rights reserved.
               </p>
               <FooterSocial />
            </div>

            {/* SITE column */}
            <nav aria-label="Footer site links">
               <h2 style={columnHeading}>Site</h2>
               {SITE_LINKS.map((link) => (
                  <button
                     key={link.id}
                     type="button"
                     className="footer-link"
                     onClick={() => scrollTo(link.id)}
                     style={columnLink}
                  >
                     {link.label}
                  </button>
               ))}
               <a
                  href={RESUME_URL}
                  download
                  className="footer-link"
                  style={columnLink}
               >
                  Download CV
               </a>
            </nav>

            {/* SOCIAL column */}
            <nav aria-label="Footer social links">
               <h2 style={columnHeading}>Social</h2>
               {socialProfiles.map((profile) => (
                  <a
                     key={profile.id}
                     href={profile.link}
                     target="_blank"
                     rel="noopener noreferrer"
                     aria-label={`${profile.name} (opens in a new tab)`}
                     className="footer-link"
                     style={columnLink}
                  >
                     {profile.name}
                  </a>
               ))}
            </nav>
         </motion.div>

         {/* Bottom row: status bar (clock, availability, stack, build stamp) */}
         <FooterStatusBar />
      </>
   );
};

export default FooterContent;
