import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import {
   MONO_FONT,
   CYAN,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   TEXT_MUTED,
} from "@/constants/theme";

interface TrophyCardProps {
   item: Achievement;
   index: number;
}

const PLACEMENT_COLORS: Record<string, string> = {
   "1st": "#fbbf24",
   "2nd": "#94a3b8",
   "3rd": "#d97706",
   "4th": TEXT_MUTED,
};

const ORDINAL_SUFFIX: Record<string, string> = {
   "1": "st",
   "2": "nd",
   "3": "rd",
};

const parsePlacement = (
   title: string,
): { rank: string; event: string; color: string } => {
   const rankMatch = title.match(/^(Rank \d+)/);
   if (rankMatch) {
      const event = title.replace(/^Rank \d+\s*-\s*/, "");
      return { rank: rankMatch[1], event, color: CYAN };
   }

   const placeMatch = title.match(/^(\d+)\w+ Place/);
   if (placeMatch) {
      const n = placeMatch[1];
      const ordinal = `${n}${ORDINAL_SUFFIX[n] ?? "th"}`;
      const event = title.replace(/^\d+\w+ Place\s*-\s*/, "");
      const color = PLACEMENT_COLORS[ordinal] ?? TEXT_MUTED;
      return { rank: ordinal, event, color };
   }

   return { rank: "", event: title, color: TEXT_MUTED };
};

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const TrophyCard = ({ item, index }: TrophyCardProps) => {
   const { rank, event, color } = parsePlacement(item.title);

   return (
      <motion.div
         className="glass-card"
         initial={{ opacity: 0, y: 25, scale: 0.97 }}
         whileInView={{ opacity: 1, y: 0, scale: 1 }}
         viewport={{ once: false, margin: "0px 0px -40px 0px" }}
         transition={{
            delay: index * 0.08,
            duration: 0.5,
            ease: EXPO_EASE,
         }}
         whileHover={{
            y: -4,
            boxShadow: `0 8px 30px ${color}25`,
            transition: { duration: 0.2 },
         }}
         style={{
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderLeft: `3px solid ${color}`,
            cursor: "default",
         }}
      >
         {/* Rank / Placement */}
         <div
            style={{
               minWidth: 52,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               flexShrink: 0,
            }}
         >
            {rank ? (
               <span
                  style={{
                     fontSize: rank.startsWith("Rank") ? 14 : 28,
                     fontWeight: 800,
                     fontFamily: MONO_FONT,
                     color,
                     lineHeight: 1,
                  }}
               >
                  {rank}
               </span>
            ) : (
               <Trophy size={24} style={{ color }} />
            )}
         </div>

         {/* Event details */}
         <div style={{ flex: 1, minWidth: 0 }}>
            <h4
               style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  lineHeight: 1.4,
                  marginBottom: 4,
               }}
            >
               {event}
            </h4>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
               }}
            >
               {item.organizer && (
                  <span
                     style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: TEXT_SECONDARY,
                     }}
                  >
                     {item.organizer}
                  </span>
               )}
               {item.date && (
                  <span
                     style={{
                        fontSize: 11,
                        fontFamily: MONO_FONT,
                        color: TEXT_MUTED,
                     }}
                  >
                     {item.date}
                  </span>
               )}
            </div>
         </div>

         {/* Type tag */}
         {item.type && (
            <span
               style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color,
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: `1px solid ${color}25`,
                  background: `${color}08`,
                  flexShrink: 0,
               }}
            >
               {item.type}
            </span>
         )}
      </motion.div>
   );
};

export default TrophyCard;
