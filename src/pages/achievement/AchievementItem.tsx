import { motion } from "motion/react";
import { Medal } from "lucide-react";
import type { Achievement } from "@/types";
import { fadeInUp } from "@utils/animations";
import { getMedalColor } from "./achievementConstants";

interface AchievementItemProps {
   item: Achievement;
   isMobile: boolean;
}

const AchievementItem = ({ item, isMobile }: AchievementItemProps) => (
   <motion.div
      className="glass-card"
      style={{
         padding: isMobile ? "14px 16px" : "16px 20px",
         display: "flex",
         alignItems: "center",
         gap: 16,
         flexWrap: "wrap",
      }}
      variants={fadeInUp}
   >
      <Medal
         size={20}
         style={{
            color: getMedalColor(item.title),
            flexShrink: 0,
         }}
      />
      <h4
         style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#eeeef5",
            flex: 1,
            minWidth: 200,
         }}
      >
         {item.title}
      </h4>
      {item.organizer && (
         <span
            style={{
               color: "#06b6d4",
               fontSize: 13,
               fontWeight: 500,
               flexShrink: 0,
            }}
         >
            {item.organizer}
         </span>
      )}
      {item.date && (
         <span className="tag tag-cyan" style={{ flexShrink: 0 }}>
            {item.date}
         </span>
      )}
   </motion.div>
);

export default AchievementItem;
