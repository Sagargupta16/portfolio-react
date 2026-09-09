import type { CSSProperties } from "react";
import {
   ArrowUpRight,
   GitMerge,
   CircleDot,
   GitPullRequestClosed,
} from "lucide-react";
import type { OpenSourceContribution } from "@/types";
import { PURPLE, GREEN, ORANGE } from "@/constants/theme";

interface ContribCardProps {
   contrib: OpenSourceContribution;
}

const STATUS_CONFIG = {
   merged: { color: PURPLE, Icon: GitMerge, label: "Merged" },
   open: { color: GREEN, Icon: CircleDot, label: "Open" },
   closed: { color: ORANGE, Icon: GitPullRequestClosed, label: "Closed" },
} as const;

const ContribCard = ({ contrib }: ContribCardProps) => {
   const config =
      STATUS_CONFIG[contrib.status as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.open;
   const { color: statusColor, Icon: StatusIcon, label: statusLabel } = config;

   return (
      <a
         href={contrib.url}
         target="_blank"
         rel="noopener noreferrer"
         title={`${contrib.repo}: ${contrib.title}`}
         className="contribution-link"
         style={{ "--contribution-accent": statusColor } as CSSProperties}
      >
         <StatusIcon
            size={14}
            className="contribution-icon"
            aria-hidden="true"
         />
         <div style={{ minWidth: 0, flex: 1 }}>
            <div className="contribution-meta">
               <span className="contribution-repo">{contrib.repo}</span>
               <span className="contribution-status">{statusLabel}</span>
            </div>
            <p className="contribution-title">{contrib.title}</p>
         </div>
         <ArrowUpRight
            size={14}
            className="contribution-icon action-arrow action-arrow--external"
            aria-hidden="true"
         />
      </a>
   );
};

export default ContribCard;
