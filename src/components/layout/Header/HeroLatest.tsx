import { useMemo } from "react";
import { motion } from "motion/react";
import {
   getOpenSourceContributions,
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/dataLoader";
import { parseDate, isValidUrl } from "@pages/portfolio/portfolioConstants";
import { staggerItem } from "@utils/animations";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";

/* One derived line under the hero intro: the most recently merged upstream PR
   and the newest shipped project. Nothing is hand-written here, so it moves on
   its own whenever the data files are updated. The hero carries no numbers. */

const HeroLatest = () => {
   const { isMobile } = useBreakpoint();

   const latest = useMemo(() => {
      const latestPr = getOpenSourceContributions()
         .filter((c) => c.status === "merged" && c.merged_at)
         .sort((a, b) =>
            (b.merged_at ?? "").localeCompare(a.merged_at ?? ""),
         )[0];
      const prText = latestPr
         ? `${latestPr.repo.split("/")[1]} #${latestPr.url.split("/").pop()} merged`
         : null;

      const newestProject = [
         ...getFeaturedProjects(),
         ...getCollaborativeProjects(),
         ...getOtherProjects(),
         ...getCommunityProjects(),
      ]
         .filter((p) => isValidUrl(p.live))
         .sort(
            (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime(),
         )[0];
      const projectText = newestProject
         ? `${newestProject.title} shipped`
         : null;

      return [prText, projectText].filter(Boolean).join(" · ");
   }, []);

   if (!latest) return null;

   return (
      <motion.div
         variants={staggerItem}
         style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "baseline",
            justifyContent: "center",
            gap: isMobile ? 4 : 14,
         }}
      >
         <span
            style={{
               fontFamily: MONO_FONT,
               fontSize: 10,
               fontWeight: 700,
               letterSpacing: "0.16em",
               textTransform: "uppercase",
               color: TEXT_MUTED,
               flexShrink: 0,
            }}
         >
            Latest
         </span>
         <span style={{ fontSize: 14, lineHeight: 1.6, color: TEXT_SECONDARY }}>
            {latest}
         </span>
      </motion.div>
   );
};

export default HeroLatest;
