import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import { CYAN, MONO_FONT, TEXT_MUTED } from "@/constants/theme";
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
            fontSize: 20,
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
            gap: 12,
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
                           color: CYAN,
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
                        color: TEXT_MUTED,
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
               gap: 4,
               marginTop: 16,
               padding: "8px 16px",
               borderRadius: 10,
               fontSize: 12,
               fontWeight: 600,
               color: CYAN,
               border: "1px solid rgba(96,165,250,0.25)",
               background: "rgba(96,165,250,0.06)",
               textDecoration: "none",
               transition: "all 0.2s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
               e.currentTarget.style.background = "rgba(96,165,250,0.15)";
               e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)";
               e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(96,165,250,0.15)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
               e.currentTarget.style.background = "rgba(96,165,250,0.06)";
               e.currentTarget.style.borderColor = "rgba(96,165,250,0.25)";
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
