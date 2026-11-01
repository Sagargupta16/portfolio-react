import { BadgeCheck, MessageCircle } from "lucide-react";
import type { CommunityDiscussion } from "@/types";
import { getSectionCopy } from "@data/sections";
import { BLUE_LIGHT, SKY } from "@/constants/theme";
import { ContributionLink } from "./ContribCard";

interface DiscussionCardProps {
   discussion: CommunityDiscussion;
}

const LABELS = getSectionCopy("projects").discussion_status;

const STATUS_CONFIG = {
   accepted: { color: BLUE_LIGHT, Icon: BadgeCheck, label: LABELS.accepted },
   helpful: { color: SKY, Icon: MessageCircle, label: LABELS.helpful },
} as const;

const DiscussionCard = ({ discussion }: DiscussionCardProps) => {
   const config =
      STATUS_CONFIG[discussion.status as keyof typeof STATUS_CONFIG] ??
      STATUS_CONFIG.helpful;

   return (
      <ContributionLink
         url={discussion.url}
         repo={discussion.repo}
         title={discussion.title}
         {...config}
      />
   );
};

export default DiscussionCard;
