import type { CSSProperties } from "react";
import { motion } from "motion/react";
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

interface CompetitionResultProps {
   item: Achievement;
   index: number;
}

const PLACEMENT_COLORS: Record<string, string> = {
   "1st": MEDAL_GOLD,
   "2nd": MEDAL_SILVER,
   "3rd": MEDAL_BRONZE,
   "4th": TEXT_MUTED,
};

const MAX_STAGGER_S = 0.2;

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

   const ordinalMatch = /^(\d+(?:st|nd|rd|th)) Place$/.exec(prefix);
   if (ordinalMatch) {
      const ordinal = ordinalMatch[1];
      const color = PLACEMENT_COLORS[ordinal] ?? TEXT_MUTED;
      return { rank: ordinal, event, color };
   }

   return { rank: "", event: title, color: TEXT_MUTED };
};

const CompetitionResult = ({ item, index }: CompetitionResultProps) => {
   const { rank, event, color } = parsePlacement(item.title);
   const { reducedMotion } = useMotionPreference();
   const isRanking = rank.startsWith("Rank ");
   const displayRank = isRanking ? rank.slice(5) : rank;
   const revealDelay = Math.min(index * 0.04, MAX_STAGGER_S);

   return (
      <motion.li
         className="competition-result"
         initial={reducedMotion ? false : { opacity: 0, y: 10 }}
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
         style={{ "--result-color": color } as CSSProperties}
      >
         <div
            className={`competition-placement${isRanking ? " competition-placement--rank" : ""}`}
            aria-hidden="true"
         >
            {rank && (
               <span className="competition-placement-label">
                  {isRanking ? "Rank" : "Place"}
               </span>
            )}
            <span className="competition-placement-value">
               {displayRank || "•"}
            </span>
         </div>

         <div className="competition-event">
            <h5 className="competition-event-title" aria-label={item.title}>
               {event}
            </h5>
            <p className="competition-event-meta">
               {item.organizer && <span>{item.organizer}</span>}
               {item.date && <span>{item.date}</span>}
               {item.type && (
                  <span className="competition-event-type">{item.type}</span>
               )}
            </p>
         </div>
      </motion.li>
   );
};

export default CompetitionResult;
