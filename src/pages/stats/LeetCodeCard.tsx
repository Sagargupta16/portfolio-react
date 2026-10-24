import { Trophy } from "lucide-react";
import type { CodingPlatformStat } from "@/types";
import { getStatsCopy } from "@data/personal";
import { newTabLabel } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import { AMBER } from "@/constants/theme";
import RatingCurve from "./RatingCurve";
import SplitBar from "./SplitBar";
import { DIFFICULTY_SHADES } from "./statsTokens";
import { Metrics, WideProfileCard } from "./WideProfileCard";

const COPY = getStatsCopy().platforms.leetcode;
const LEVELS = ["easy", "medium", "hard"] as const;

interface LeetCodeCardProps {
   stats: CodingPlatformStat;
}

/** Contest rating over every attended contest and the solved split, from the
 *  weekly sync (coding_platform_stats.leetcode). */
const LeetCodeCard = ({ stats }: Readonly<LeetCodeCardProps>) => {
   const solved = stats.solved_by_difficulty;
   const meta = [
      stats.badge,
      stats.top_percentage &&
         fillTemplate(COPY.top, { top: stats.top_percentage }),
   ]
      .filter(Boolean)
      .join(" | ");

   return (
      <WideProfileCard
         area="leetcode"
         icon={<Trophy size={18} style={{ color: AMBER }} aria-hidden="true" />}
         label={COPY.label}
         color={AMBER}
         meta={meta}
         href={stats.url}
         linkLabel={newTabLabel(
            fillTemplate(COPY.profile_label, { username: stats.username }),
         )}
      >
         <Metrics
            items={[
               { value: stats.best_rating ?? "", label: COPY.best_rating },
               {
                  value: stats.problems_solved ?? "",
                  label: COPY.problems_solved,
               },
               { value: stats.contests ?? "", label: COPY.contests },
            ]}
         />
         {stats.rating_history && (
            <RatingCurve history={stats.rating_history} color={AMBER} />
         )}
         {solved && (
            <SplitBar
               heading={COPY.difficulty}
               segments={LEVELS.map((key) => ({
                  key,
                  label: COPY[key],
                  weight: solved[key],
                  display: String(solved[key]),
                  color: DIFFICULTY_SHADES[key],
               }))}
            />
         )}
      </WideProfileCard>
   );
};

export default LeetCodeCard;
