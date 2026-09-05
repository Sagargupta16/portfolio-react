import { useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { getName, getSiteConfig, getSocialProfiles } from "@data/personal";
import { staggerItem } from "@utils/animations";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import { CONTENT_SECTIONS, type ContentSectionId } from "@/constants/sections";
import useBreakpoint from "@hooks/useBreakpoint";
import FooterSocial from "./FooterSocial";

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

const columnHeading: React.CSSProperties = {
   fontSize: 12,
   fontWeight: 700,
   letterSpacing: "0.15em",
   textTransform: "uppercase",
   color: "#9ee8f2",
   marginBottom: 12,
};

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
   const name = useMemo(() => getName(), []);
   const siteConfig = useMemo(() => getSiteConfig(), []);
   const socialProfiles = useMemo(() => getSocialProfiles(), []);
   const techStack = siteConfig.tech_stack || [];

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
               <span
                  style={{
                     width: 48,
                     height: 48,
                     borderRadius: 12,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     fontSize: 18,
                     fontWeight: 800,
                     color: "#0b1012",
                     background: "#67e8f9",
                  }}
                  aria-hidden="true"
               >
                  SG
               </span>
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
                     onClick={() => scrollTo(link.id)}
                     style={columnLink}
                     onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                     }}
                     onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = LINK_COLOR;
                     }}
                  >
                     {link.label}
                  </button>
               ))}
               <a
                  href={RESUME_URL}
                  download
                  style={columnLink}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                     e.currentTarget.style.color = TEXT_PRIMARY;
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                     e.currentTarget.style.color = LINK_COLOR;
                  }}
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
                     style={columnLink}
                     onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                     }}
                     onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.currentTarget.style.color = LINK_COLOR;
                     }}
                  >
                     {profile.name}
                  </a>
               ))}
            </nav>
         </motion.div>

         {/* Bottom row: tech strip */}
         <motion.div
            style={{
               display: "flex",
               justifyContent: "center",
               width: "100%",
               paddingTop: 20,
               borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
            variants={staggerItem}
         >
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
               }}
            >
               <span
                  style={{
                     fontSize: 11,
                     color: "rgba(244,246,247,0.85)",
                     fontFamily: MONO_FONT,
                  }}
               >
                  Built with
               </span>
               {techStack.map((tech) => (
                  <span
                     key={tech}
                     style={{
                        fontSize: 10,
                        color: LINK_COLOR,
                        fontFamily: MONO_FONT,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                     }}
                  >
                     {tech}
                  </span>
               ))}
            </div>
         </motion.div>
      </>
   );
};

export default FooterContent;
