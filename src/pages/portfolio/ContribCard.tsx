import { GitMerge, CircleDot } from "lucide-react";
import type { OpenSourceContribution } from "@/types";
import { MONO_FONT } from "@/constants/theme";

interface ContribCardProps {
   contrib: OpenSourceContribution;
}

const ContribCard = ({ contrib }: ContribCardProps) => {
   const isMerged = contrib.status === "merged";
   const statusColor = isMerged ? "#a855f7" : "#22c55e";
   const StatusIcon = isMerged ? GitMerge : CircleDot;
   const hoverBg = isMerged ? "rgba(168,85,247,0.06)" : "rgba(34,197,94,0.06)";
   const hoverBorder = isMerged
      ? "rgba(168,85,247,0.2)"
      : "rgba(34,197,94,0.2)";

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
            border: `1px solid ${isMerged ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.04)"}`,
            textDecoration: "none",
            transition: "all 0.2s",
         }}
         onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.borderColor = hoverBorder;
         }}
         onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = isMerged
               ? "rgba(168,85,247,0.1)"
               : "rgba(255,255,255,0.04)";
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
                     background: isMerged
                        ? "rgba(168,85,247,0.12)"
                        : "rgba(34,197,94,0.1)",
                     color: statusColor,
                     border: `1px solid ${isMerged ? "rgba(168,85,247,0.25)" : "rgba(34,197,94,0.2)"}`,
                     flexShrink: 0,
                  }}
               >
                  {isMerged ? "Merged" : "Open"}
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
