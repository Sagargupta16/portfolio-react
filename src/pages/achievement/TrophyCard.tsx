import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   CYAN,
   DURATION,
   EASING,
   TEXT_MUTED,
   MEDAL_GOLD,
   MEDAL_SILVER,
   MEDAL_BRONZE,
} from "@/constants/theme";

interface TrophyCardProps {
   item: Achievement;
   index: number;
}

const PLACEMENT_COLORS: Record<string, string> = {
   "1st": MEDAL_GOLD,
   "2nd": MEDAL_SILVER,
   "3rd": MEDAL_BRONZE,
   "4th": TEXT_MUTED,
};

const ORDINAL_SUFFIX: Record<string, string> = {
   "1": "st",
   "2": "nd",
   "3": "rd",
};

const MAX_STAGGER_S = 0.3;

/* Lift only: .glass-card CSS owns the border shift, which keeps the coloured
   left accent intact (Motion would overwrite all four sides). */
const HOVER_LIFT = {
   y: -2,
   transition: { type: "spring" as const, visualDuration: 0.2, bounce: 0.12 },
};

const splitTitle = (title: string): [string, string] => {
   const idx = title.indexOf(" - ");
   return idx >= 0 ? [title.slice(0, idx), title.slice(idx + 3)] : [title, ""];
};

const parsePlacement = (
   title: string,
): { rank: string; event: string; color: string } => {
   const [prefix, event] = splitTitle(title);

   if (prefix.startsWith("Rank ")) {
      return { rank: prefix, event, color: CYAN };
   }

   const numMatch = /^(\d+)/.exec(prefix);
   if (numMatch && prefix.includes("Place")) {
      const n = numMatch[1];
      const ordinal = `${n}${ORDINAL_SUFFIX[n] ?? "th"}`;
      const color = PLACEMENT_COLORS[ordinal] ?? TEXT_MUTED;
      return { rank: ordinal, event, color };
   }

   return { rank: "", event: title, color: TEXT_MUTED };
};

const TrophyCard = ({ item, index }: TrophyCardProps) => {
   const { rank, event, color } = parsePlacement(item.title);
   const { reducedMotion } = useMotionPreference();
   const lift = reducedMotion ? undefined : HOVER_LIFT;
   const isRanking = rank.startsWith("Rank ");
   const displayRank = isRanking ? rank.slice(5) : rank;
   const revealDelay = Math.min(index * 0.05, MAX_STAGGER_S);

   return (
      <motion.div
         className="glass-card award-card"
         initial={reducedMotion ? false : { opacity: 0, y: 12 }}
         whileInView={{
            opacity: 1,
            y: 0,
            transition: {
               delay: reducedMotion ? 0 : revealDelay,
               duration: reducedMotion ? 0 : DURATION.default,
               ease: EASING.cinematic,
            },
         }}
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
         transition={{
            duration: DURATION.quick,
            ease: EASING.brisk,
         }}
         whileHover={lift}
         style={
            {
               "--award-accent": color,
               borderLeft: `3px solid ${color}`,
            } as CSSProperties
         }
      >
         {/* Rank / Placement */}
         <motion.div
            className={`award-rank${isRanking ? " award-rank--numeric" : ""}`}
            initial={
               reducedMotion ? false : { opacity: 0, scale: 0.8, rotate: -12 }
            }
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={
               reducedMotion
                  ? { duration: 0 }
                  : {
                       type: "spring",
                       visualDuration: 0.3,
                       bounce: 0.15,
                       delay: revealDelay + 0.05,
                    }
            }
            aria-hidden="true"
         >
            {rank ? (
               <>
                  <span className="award-rank-value">{displayRank}</span>
                  <span className="award-rank-caption">
                     {isRanking ? "Rank" : "Place"}
                  </span>
               </>
            ) : (
               <Trophy size={20} />
            )}
         </motion.div>

         {/* Event details */}
         <div className="award-body">
            <h4 className="award-title" aria-label={item.title}>
               {event}
            </h4>
            <div className="award-meta">
               {item.organizer && (
                  <span className="award-organizer">{item.organizer}</span>
               )}
               {item.date && <span>{item.date}</span>}
               {item.type && <span className="award-type">{item.type}</span>}
            </div>
         </div>
      </motion.div>
   );
};

export default TrophyCard;
