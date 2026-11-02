import { motion } from "motion/react";
import { getHeroLatest } from "@data/heroLatest";
import { getUiCopy, newTabLabel } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import { MONO_FONT, TEXT_MUTED } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import { heroLatest } from "./heroMotion";

const COPY = getUiCopy().hero;

/* One derived line under the hero intro: the most recently merged upstream PR
   and the newest shipped project. Nothing is hand-written here (the wording
   is the hero copy in data/ui.json), so it moves on its own whenever the data
   files are updated. The two picks are made at build time from projects.json
   (heroLatestPlugin.js), so this chunk does not load the projects data. The
   hero carries no numbers. */
const { pr, project } = getHeroLatest();
const LATEST: { text: string; href: string }[] = [];
if (pr) {
   LATEST.push({
      text: fillTemplate(COPY.latest_pr, { repo: pr.repo, number: pr.number }),
      href: pr.url,
   });
}
if (project) {
   LATEST.push({
      text: fillTemplate(COPY.latest_project, { title: project.title }),
      href: project.live,
   });
}

const HeroLatest = () => {
   const { isMobile } = useBreakpoint();

   if (!LATEST.length) return null;

   return (
      <motion.div
         variants={heroLatest}
         style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 4 : 14,
         }}
      >
         <span
            style={{
               fontFamily: MONO_FONT,
               fontSize: 11,
               fontWeight: 700,
               letterSpacing: "0.16em",
               textTransform: "uppercase",
               color: TEXT_MUTED,
               flexShrink: 0,
            }}
         >
            {COPY.latest}
         </span>
         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               alignItems: "center",
               justifyContent: "center",
               gap: "0 12px",
               fontSize: 14,
               lineHeight: 1.6,
            }}
         >
            {LATEST.map(({ text, href }) => (
               <a
                  key={href}
                  href={href}
                  className="hero-latest-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={newTabLabel(text)}
               >
                  {text}
               </a>
            ))}
         </div>
      </motion.div>
   );
};

export default HeroLatest;
