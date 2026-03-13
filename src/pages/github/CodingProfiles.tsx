import { motion } from "motion/react";
import { ArrowUpRight, Trophy, Code, Star } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { getCodingPlatformStats } from "@data/dataLoader";
import { staggerContainer, fadeInUp } from "@utils/animations";
import {
   MONO_FONT,
   PURPLE,
   AMBER,
   TEXT_PRIMARY,
   TEXT_MUTED,
} from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";

const PLATFORM_CONFIG: Record<
   string,
   {
      label: string;
      color: string;
      icon: typeof Trophy;
      highlight: (stats: Record<string, unknown>) => string;
      subtitle: (stats: Record<string, unknown>) => string;
   }
> = {
   leetcode: {
      label: "LeetCode",
      color: AMBER,
      icon: Trophy,
      highlight: (s) => `${s.best_rating} ${s.badge}`,
      subtitle: (s) => `${s.problems_solved} solved | ${s.contests} contests`,
   },
   geeksforgeeks: {
      label: "GeeksforGeeks",
      color: "#2f8d46",
      icon: Code,
      highlight: (s) => `${s.problems_solved}`,
      subtitle: () => "Problems Solved",
   },
   hackerrank: {
      label: "HackerRank",
      color: PURPLE,
      icon: Star,
      highlight: (s) => `${s.problem_solving}`,
      subtitle: (s) => `Problem Solving | ${s.cpp} C++`,
   },
};

interface CodingProfilesProps {
   githubUsername: string;
}

const CodingProfiles = ({ githubUsername }: CodingProfilesProps) => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const stats = getCodingPlatformStats();
   const entries = Object.entries(stats).filter(
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
      gap: 8,
   };

   return (
      <div style={{ marginTop: 48 }}>
         <motion.h3
            variants={fadeInUp}
            style={{
               fontSize: 18,
               fontWeight: 700,
               color: TEXT_PRIMARY,
               marginBottom: 20,
               textAlign: "center",
            }}
         >
            Profiles
         </motion.h3>

         <motion.div
            variants={staggerContainer}
            style={{
               display: "grid",
               gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : `repeat(${entries.length + 1}, 1fr)`,
               gap: 12,
            }}
         >
            {/* GitHub profile card */}
            <motion.a
               href={`https://github.com/${githubUsername}`}
               target="_blank"
               rel="noopener noreferrer"
               className="glass-card"
               variants={fadeInUp}
               whileHover={{ y: -4, borderColor: "rgba(165,165,192,0.3)" }}
               style={cardStyle}
            >
               <FaGithub size={20} style={{ color: TEXT_PRIMARY }} />
               <span
                  style={{
                     fontSize: 12,
                     fontWeight: 600,
                     color: TEXT_PRIMARY,
                     textTransform: "uppercase",
                     letterSpacing: "0.04em",
                  }}
               >
                  GitHub
               </span>
               <span
                  style={{
                     fontSize: 22,
                     fontWeight: 700,
                     fontFamily: MONO_FONT,
                     color: TEXT_PRIMARY,
                     lineHeight: 1,
                  }}
               >
                  {githubUsername}
               </span>
               <span style={{ fontSize: 11, color: TEXT_MUTED }}>
                  Open Source Contributions
               </span>
               <span
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 4,
                     fontSize: 11,
                     color: TEXT_PRIMARY,
                     marginTop: 4,
                  }}
               >
                  View Profile <ArrowUpRight size={12} />
               </span>
            </motion.a>

            {/* Coding platform cards */}
            {entries.map(([key, data]) => {
               const config = PLATFORM_CONFIG[key];
               const s = data as Record<string, unknown>;
               const url = s.url as string | undefined;

               return (
                  <motion.a
                     key={key}
                     href={url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="glass-card"
                     variants={fadeInUp}
                     whileHover={{ y: -4, borderColor: `${config.color}40` }}
                     style={cardStyle}
                  >
                     <config.icon size={20} style={{ color: config.color }} />
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
                     <span
                        style={{
                           fontSize: 22,
                           fontWeight: 700,
                           fontFamily: MONO_FONT,
                           color: TEXT_PRIMARY,
                           lineHeight: 1,
                        }}
                     >
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
                        View <ArrowUpRight size={12} />
                     </span>
                  </motion.a>
               );
            })}
         </motion.div>
      </div>
   );
};

export default CodingProfiles;
