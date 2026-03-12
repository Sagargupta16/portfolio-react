import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import { formatStatLabel, isNumericStat } from "./achievementConstants";

interface CodingPlatformCardProps {
   platform: string;
   stats: Record<string, unknown>;
}

const CodingPlatformCard = ({ platform, stats }: CodingPlatformCardProps) => (
   <motion.div
      className="glass-card"
      style={{ padding: 28, textAlign: "center" }}
      variants={fadeInUp}
   >
      <h4
         className="gradient-text"
         style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 20,
            textTransform: "capitalize",
         }}
      >
         {platform}
      </h4>
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
         }}
      >
         {((stats.displayStats as string[]) || Object.keys(stats))
            .filter(
               (key: string) =>
                  key !== "username" &&
                  key !== "profileUrl" &&
                  key !== "displayStats",
            )
            .map((key: string) => [key, stats[key]])
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => (
               <div key={`${platform}-${key as string}`}>
                  {isNumericStat(value) ? (
                     <AnimatedCounter value={String(value)} />
                  ) : (
                     <span
                        className="glow-cyan-text"
                        style={{
                           color: "#06b6d4",
                           fontSize: "1.875rem",
                           fontWeight: 700,
                           fontFamily: MONO_FONT,
                           display: "block",
                        }}
                     >
                        {value as string}
                     </span>
                  )}
                  <span
                     style={{
                        color: "#6e6e90",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 500,
                        marginTop: 4,
                        display: "block",
                     }}
                  >
                     {formatStatLabel(key as string)}
                  </span>
               </div>
            ))}
      </div>
      {(stats.profileUrl as string | undefined) && (
         <a
            href={stats.profileUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            style={{
               display: "inline-flex",
               alignItems: "center",
               gap: 6,
               marginTop: 18,
               padding: "8px 16px",
               borderRadius: 8,
               fontSize: 12,
               fontWeight: 600,
               color: "#06b6d4",
               border: "1px solid rgba(6,182,212,0.25)",
               background: "rgba(6,182,212,0.06)",
               textDecoration: "none",
               transition: "all 0.2s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
               e.currentTarget.style.background = "rgba(6,182,212,0.15)";
               e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
               e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(6,182,212,0.15)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
               e.currentTarget.style.background = "rgba(6,182,212,0.06)";
               e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)";
               e.currentTarget.style.boxShadow = "none";
            }}
            aria-label={`View ${platform} profile`}
         >
            View Profile
            <ArrowUpRight size={14} />
         </a>
      )}
   </motion.div>
);

export default CodingPlatformCard;
