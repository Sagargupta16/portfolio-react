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
   y: -4,
   transition: { duration: DURATION.quick, ease: EASING.brisk },
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

   return (
      <motion.div
         className="glass-card award-card"
         initial={{ opacity: 0, y: 24 }}
         whileInView={{
            opacity: 1,
            y: 0,
            transition: {
               delay: Math.min(index * 0.05, MAX_STAGGER_S),
               duration: 0.5,
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
         <div
            className={`award-rank${isRanking ? " award-rank--numeric" : ""}`}
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
               <Trophy size={24} />
            )}
         </div>

         {/* Event details */}
         <div className="award-body">
            <h4 className="award-title" aria-label={item.title}>
               {event}
            </h4>
            {item.organizer && (
               <p className="award-organizer">{item.organizer}</p>
            )}
            <div className="award-footer">
               {item.date && <span>{item.date}</span>}
               {item.type && <span className="award-type">{item.type}</span>}
            </div>
         </div>
      </motion.div>
   );
};

export default TrophyCard;
