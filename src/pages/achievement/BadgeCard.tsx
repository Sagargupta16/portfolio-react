import { motion } from "motion/react";
import { BookOpen, ExternalLink } from "lucide-react";
import type { LearningBadge } from "@/types";
import { clipRevealUp } from "@utils/animations";

interface BadgeCardProps {
   badge: LearningBadge;
}

const BadgeCard = ({ badge }: BadgeCardProps) => (
   <motion.div
      className="glass-card"
      style={{
         padding: "12px 20px",
         display: "flex",
         alignItems: "center",
         gap: 14,
      }}
      variants={clipRevealUp}
   >
      {badge.imageUrl ? (
         <img
            src={badge.imageUrl}
            alt={badge.name}
            loading="lazy"
            style={{
               width: 32,
               height: 32,
               borderRadius: 6,
               objectFit: "contain",
               flexShrink: 0,
               background: "rgba(255,255,255,0.03)",
            }}
         />
      ) : (
         <div
            style={{
               width: 32,
               height: 32,
               borderRadius: 6,
               background: "rgba(168,85,247,0.1)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <BookOpen style={{ width: 14, height: 14, color: "#a855f7" }} />
         </div>
      )}
      <span
         style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#eeeef5",
            flex: 1,
            lineHeight: 1.4,
         }}
      >
         {badge.name}
      </span>
      {badge.badgeUrl && (
         <a
            href={badge.badgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
               color: "#a855f7",
               flexShrink: 0,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               width: 28,
               height: 28,
               borderRadius: 6,
            }}
            title="View Badge"
         >
            <ExternalLink style={{ width: 14, height: 14 }} />
         </a>
      )}
   </motion.div>
);

export default BadgeCard;
