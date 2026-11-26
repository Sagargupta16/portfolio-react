import type { CSSProperties } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ContribItem } from "./contribGroups";

interface ContribRowProps {
   item: ContribItem;
   color: string;
   Icon: LucideIcon;
}

/** One line of the open source digest and of its full list: group icon, repo,
 *  title, external arrow. The group a row sits in already says its status. */
const ContribRow = ({ item, color, Icon }: ContribRowProps) => (
   <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${item.repo}: ${item.title}`}
      className="contrib-row"
      style={{ "--contribution-accent": color } as CSSProperties}
   >
      <Icon size={14} className="contrib-row-icon" aria-hidden="true" />
      <span className="contrib-row-repo">{item.repo}</span>
      <span className="contrib-row-title">{item.title}</span>
      <ArrowUpRight
         size={14}
         className="contrib-row-arrow action-arrow action-arrow--external"
         aria-hidden="true"
      />
   </a>
);

export default ContribRow;
