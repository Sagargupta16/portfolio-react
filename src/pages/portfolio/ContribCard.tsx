import { GitMerge, CircleDot, GitPullRequestClosed } from "lucide-react";
import type { OpenSourceContribution } from "@/types";
import { MONO_FONT } from "@/constants/theme";

interface ContribCardProps {
   contrib: OpenSourceContribution;
}

const STATUS_CONFIG = {
   merged: { color: "#a855f7", Icon: GitMerge, label: "Merged" },
   open: { color: "#22c55e", Icon: CircleDot, label: "Open" },
   closed: { color: "#f97316", Icon: GitPullRequestClosed, label: "Closed" },
} as const;

const ContribCard = ({ contrib }: ContribCardProps) => {
   const config = STATUS_CONFIG[contrib.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
   const { color: statusColor, Icon: StatusIcon, label: statusLabel } = config;
   const hoverBg = `${statusColor}0F`;
   const hoverBorder = `${statusColor}33`;

   return (
      <a
         href={contrib.url}
         target="_blank"
         rel="noopener noreferrer"
         style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${statusColor}1A`,
            textDecoration: "none",
            transition: "all 0.2s",
         }}
         onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.borderColor = hoverBorder;
         }}
         onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = `${statusColor}1A`;
         }}
      >
         <StatusIcon
            size={14}
            style={{ color: statusColor, flexShrink: 0, marginTop: 3 }}
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
                     color: statusColor,
                     fontWeight: 600,
                  }}
               >
                  {contrib.repo}
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
                     background: `${statusColor}1F`,
                     color: statusColor,
                     border: `1px solid ${statusColor}40`,
                     flexShrink: 0,
                  }}
               >
                  {statusLabel}
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
               {contrib.title}
            </p>
         </div>
      </a>
   );
};

export default ContribCard;
