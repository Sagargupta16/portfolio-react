import { BadgeCheck, MessageCircle } from "lucide-react";
import type { CommunityDiscussion } from "@/types";
import { MONO_FONT, CYAN, PURPLE, TEXT_SECONDARY } from "@/constants/theme";

interface DiscussionCardProps {
   discussion: CommunityDiscussion;
}

const STATUS_CONFIG = {
   accepted: { color: CYAN, Icon: BadgeCheck, label: "Accepted" },
   helpful: { color: PURPLE, Icon: MessageCircle, label: "Helpful" },
} as const;

const DiscussionCard = ({ discussion }: DiscussionCardProps) => {
   const config =
      STATUS_CONFIG[discussion.status as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.helpful;
   const { color, Icon, label } = config;
   const hoverBg = `${color}0F`;
   const hoverBorder = `${color}33`;

   return (
      <a
         href={discussion.url}
         target="_blank"
         rel="noopener noreferrer"
         style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "12px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${color}1A`,
            textDecoration: "none",
            transition: "all 0.2s",
         }}
         onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.borderColor = hoverBorder;
         }}
         onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = `${color}1A`;
         }}
      >
         <Icon
            size={14}
            style={{ color, flexShrink: 0, marginTop: 3 }}
         />
         <div style={{ minWidth: 0, flex: 1 }}>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "space-between",
               }}
            >
               <span
                  style={{
                     fontSize: 11,
                     fontFamily: MONO_FONT,
                     color,
                     fontWeight: 600,
                  }}
               >
                  {discussion.repo}
               </span>
               <span
                  style={{
                     fontSize: 9,
                     fontFamily: MONO_FONT,
                     fontWeight: 700,
                     letterSpacing: "0.05em",
                     textTransform: "uppercase",
                     padding: "2px 4px",
                     borderRadius: 4,
                     background: `${color}1F`,
                     color,
                     border: `1px solid ${color}40`,
                     flexShrink: 0,
                  }}
               >
                  {label}
               </span>
            </div>
            <p
               style={{
                  fontSize: 12,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.5,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
               }}
            >
               {discussion.title}
            </p>
         </div>
      </a>
   );
};

export default DiscussionCard;
