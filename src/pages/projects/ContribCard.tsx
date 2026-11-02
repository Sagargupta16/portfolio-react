import type { CSSProperties } from "react";
import {
   ArrowUpRight,
   GitMerge,
   CircleDot,
   GitPullRequestClosed,
   type LucideIcon,
} from "lucide-react";
import type { OpenSourceContribution } from "@/types";
import { getSectionCopy } from "@data/sections";
import { SKY, GREEN, ORANGE } from "@/constants/theme";

interface ContributionLinkProps {
   url: string;
   repo: string;
   title: string;
   color: string;
   Icon: LucideIcon;
   label: string;
}

/** The card row an upstream PR and a community discussion share: status icon,
 *  repo and status label, title, external arrow. */
export const ContributionLink = ({
   url,
   repo,
   title,
   color,
   Icon,
   label,
}: ContributionLinkProps) => (
   <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${repo}: ${title}`}
      className="contribution-link"
      style={{ "--contribution-accent": color } as CSSProperties}
   >
      <Icon size={14} className="contribution-icon" aria-hidden="true" />
      <div style={{ minWidth: 0, flex: 1 }}>
         <div className="contribution-meta">
            <span className="contribution-repo">{repo}</span>
            <span className="contribution-status">{label}</span>
         </div>
         <p className="contribution-title">{title}</p>
      </div>
      <ArrowUpRight
         size={14}
         className="contribution-icon action-arrow action-arrow--external"
         aria-hidden="true"
      />
   </a>
);

interface ContribCardProps {
   contrib: OpenSourceContribution;
}

const LABELS = getSectionCopy("projects").contribution_status;

const STATUS_CONFIG = {
   merged: { color: SKY, Icon: GitMerge, label: LABELS.merged },
   open: { color: GREEN, Icon: CircleDot, label: LABELS.open },
   closed: { color: ORANGE, Icon: GitPullRequestClosed, label: LABELS.closed },
} as const;

const ContribCard = ({ contrib }: ContribCardProps) => {
   const config =
      STATUS_CONFIG[contrib.status as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.open;

   return (
      <ContributionLink
         url={contrib.url}
         repo={contrib.repo}
         title={contrib.title}
         {...config}
      />
   );
};

export default ContribCard;
