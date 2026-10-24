import { useMemo } from "react";
import { motion } from "motion/react";
import {
   getOpenSourceContributions,
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/projects";
import { getUiCopy, newTabLabel } from "@data/ui";
import { parseProjectDate, hasProjectUrl } from "@utils/projectMetadata";
import { fillTemplate } from "@utils/fillTemplate";
import { MONO_FONT, TEXT_MUTED } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import { heroLatest } from "./heroMotion";

const COPY = getUiCopy().hero;

/* One derived line under the hero intro: the most recently merged upstream PR
   and the newest shipped project. Nothing is hand-written here (the wording
   is the hero copy in data/ui.json), so it moves on its own whenever the data
   files are updated. The hero carries no numbers. */

const HeroLatest = () => {
   const { isMobile } = useBreakpoint();

   const latest = useMemo(() => {
      const latestPr = getOpenSourceContributions()
         .filter((c) => c.status === "merged" && c.merged_at)
         .sort((a, b) =>
            (b.merged_at ?? "").localeCompare(a.merged_at ?? ""),
         )[0];
      const prText = latestPr
         ? fillTemplate(COPY.latest_pr, {
              repo: latestPr.repo.split("/")[1],
              number: latestPr.url.split("/").pop(),
           })
         : null;

      const newestProject = [
         ...getFeaturedProjects(),
         ...getCollaborativeProjects(),
         ...getOtherProjects(),
         ...getCommunityProjects(),
      ]
         .filter((p) => hasProjectUrl(p.live))
         .sort(
            (a, b) =>
               parseProjectDate(b.date).getTime() -
               parseProjectDate(a.date).getTime(),
         )[0];
      const projectText = newestProject
         ? fillTemplate(COPY.latest_project, { title: newestProject.title })
         : null;

      const links: { text: string; href: string }[] = [];
      if (latestPr && prText) {
         links.push({ text: prText, href: latestPr.url });
      }
      if (newestProject && projectText && hasProjectUrl(newestProject.live)) {
         links.push({ text: projectText, href: newestProject.live });
      }
      return links;
   }, []);

   if (!latest.length) return null;

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
            {latest.map(({ text, href }) => (
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
