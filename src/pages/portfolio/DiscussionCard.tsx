import { BadgeCheck } from "lucide-react";
import type { CommunityDiscussion } from "@/types";
import { MONO_FONT } from "@/constants/theme";

interface DiscussionCardProps {
   discussion: CommunityDiscussion;
}

const ACCEPTED_COLOR = "#06b6d4";

const DiscussionCard = ({ discussion }: DiscussionCardProps) => {
   const hoverBg = `${ACCEPTED_COLOR}0F`;
   const hoverBorder = `${ACCEPTED_COLOR}33`;

   return (
      <a
         href={discussion.url}
         target="_blank"
         rel="noopener noreferrer"
         style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${ACCEPTED_COLOR}1A`,
            textDecoration: "none",
            transition: "all 0.2s",
         }}
         onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.borderColor = hoverBorder;
         }}
         onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = `${ACCEPTED_COLOR}1A`;
         }}
      >
         <BadgeCheck
            size={14}
            style={{ color: ACCEPTED_COLOR, flexShrink: 0, marginTop: 3 }}
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
                     color: ACCEPTED_COLOR,
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
                     padding: "2px 6px",
                     borderRadius: 4,
                     background: `${ACCEPTED_COLOR}1F`,
                     color: ACCEPTED_COLOR,
                     border: `1px solid ${ACCEPTED_COLOR}40`,
                     flexShrink: 0,
                  }}
               >
                  Accepted
               </span>
            </div>
            <p
               style={{
                  fontSize: 12,
                  color: "#a5a5c0",
                  lineHeight: 1.4,
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
