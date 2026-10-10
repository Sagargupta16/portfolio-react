import { motion } from "motion/react";
import { ArrowUpRight, Code, Star } from "lucide-react";
import { getCodingPlatformStats } from "@data/achievements";
import type { CodingPlatformStat } from "@/types";
import { staggerContainer, fadeInUp } from "@utils/animations";
import {
   MONO_FONT,
   PURPLE,
   TEXT_PRIMARY,
   TEXT_MUTED,
   DURATION,
   EASING,
} from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import GitHubCard from "./GitHubCard";
import LeetCodeCard from "./LeetCodeCard";

// GitHub and LeetCode carry numbers and charts in their own cards; the
// platforms that report a single figure keep the compact link card.
const PLATFORM_CONFIG: Record<
   string,
   {
      label: string;
      color: string;
      icon: typeof Code;
      highlight: (stats: CodingPlatformStat) => string;
      subtitle: (stats: CodingPlatformStat) => string;
   }
> = {
   geeksforgeeks: {
      label: "GeeksforGeeks",
      // Brighter than the GfG brand green: #2f8d46 is 4.44:1 at 11px here.
      color: "#34a853",
      icon: Code,
      highlight: (s) => s.problems_solved ?? "",
      subtitle: () => "Problems Solved",
   },
   hackerrank: {
      label: "HackerRank",
      color: PURPLE,
      icon: Star,
      highlight: (s) => s.problem_solving ?? "",
      subtitle: (s) => `Problem Solving | ${s.cpp ?? "?"} C++`,
   },
};

// Desktop: GitHub over the two compact cards on the left, LeetCode's taller
// chart card on the right. Phones stack them, compact cards two-up.
const AREAS_DESKTOP = '"github leetcode" "compact leetcode"';
const AREAS_MOBILE = '"github" "leetcode" "compact"';

interface CodingProfilesProps {
   githubUsername: string;
}

const CodingProfiles = ({ githubUsername }: Readonly<CodingProfilesProps>) => {
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   const lift = reducedMotion ? undefined : { y: -4 };
   const stats = getCodingPlatformStats();
   const compact = Object.entries(stats).filter(
      ([key]) => key in PLATFORM_CONFIG,
   );

   const cardStyle = {
      padding: "20px 16px",
      textAlign: "center" as const,
      textDecoration: "none",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 140,
      // Long mono strings must shrink inside the grid track instead of
      // widening it on small phones.
      minWidth: 0,
      overflow: "hidden",
   };

   const highlightStyle = {
      fontSize: isMobile ? 18 : 24,
      fontWeight: 700,
      fontFamily: MONO_FONT,
      color: TEXT_PRIMARY,
      lineHeight: 1,
      maxWidth: "100%",
      overflowWrap: "anywhere" as const,
   };

   return (
      <div style={{ marginTop: 48 }}>
         <motion.div className="subsection-heading" variants={fadeInUp}>
            <Code size={22} style={{ color: PURPLE }} aria-hidden="true" />
            <h3>Coding Platform Profiles</h3>
         </motion.div>

         <motion.div
            variants={staggerContainer}
            style={{
               display: "grid",
               gridTemplateColumns: isMobile
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",
               gridTemplateAreas: isMobile ? AREAS_MOBILE : AREAS_DESKTOP,
               gap: 12,
            }}
         >
            <GitHubCard username={githubUsername} stats={stats.github} />
            {stats.leetcode && <LeetCodeCard stats={stats.leetcode} />}

            <div
               style={{
                  gridArea: "compact",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
               }}
            >
               {compact.map(([key, s]) => {
                  const config = PLATFORM_CONFIG[key];
                  return (
                     <motion.a
                        key={key}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card"
                        variants={fadeInUp}
                        whileHover={lift}
                        whileFocus={lift}
                        transition={{
                           duration: DURATION.quick,
                           ease: EASING.brisk,
                        }}
                        style={cardStyle}
                     >
                        <config.icon
                           size={20}
                           style={{ color: config.color }}
                        />
                        <span
                           style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: config.color,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                           }}
                        >
                           {config.label}
                        </span>
                        <span style={highlightStyle}>
                           {config.highlight(s)}
                        </span>
                        <span style={{ fontSize: 11, color: TEXT_MUTED }}>
                           {config.subtitle(s)}
                        </span>
                        <span
                           style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              color: config.color,
                              marginTop: 4,
                           }}
                        >
                           View
                           <ArrowUpRight
                              size={14}
                              className="action-arrow action-arrow--external"
                              aria-hidden="true"
                           />
                        </span>
                     </motion.a>
                  );
               })}
            </div>
         </motion.div>
      </div>
   );
};

export default CodingProfiles;
