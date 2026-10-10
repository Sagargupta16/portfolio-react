import { Trophy } from "lucide-react";
import type { CodingPlatformStat } from "@/types";
import { AMBER } from "@/constants/theme";
import RatingCurve from "./RatingCurve";
import SplitBar from "./SplitBar";
import { DIFFICULTY_SHADES } from "./statsTokens";
import { Metrics, WideProfileCard } from "./WideProfileCard";

const LEVELS = [
   { key: "easy", label: "Easy" },
   { key: "medium", label: "Medium" },
   { key: "hard", label: "Hard" },
] as const;

interface LeetCodeCardProps {
   stats: CodingPlatformStat;
}

/** Contest rating over every attended contest and the solved split, from the
 *  weekly sync (coding_platform_stats.leetcode). */
const LeetCodeCard = ({ stats }: Readonly<LeetCodeCardProps>) => {
   const solved = stats.solved_by_difficulty;
   const meta = [
      stats.badge,
      stats.top_percentage && `top ${stats.top_percentage}`,
   ]
      .filter(Boolean)
      .join(" | ");

   return (
      <WideProfileCard
         area="leetcode"
         icon={<Trophy size={18} style={{ color: AMBER }} aria-hidden="true" />}
         label="LeetCode"
         color={AMBER}
         meta={meta}
         href={stats.url}
         linkLabel={`LeetCode profile ${stats.username} (opens in a new tab)`}
      >
         <Metrics
            items={[
               { value: stats.best_rating ?? "", label: "Peak rating" },
               { value: stats.problems_solved ?? "", label: "Solved" },
               { value: stats.contests ?? "", label: "Contests" },
            ]}
         />
         {stats.rating_history && (
            <RatingCurve history={stats.rating_history} color={AMBER} />
         )}
         {solved && (
            <SplitBar
               heading="Solved by difficulty"
               segments={LEVELS.map(({ key, label }) => ({
                  key,
                  label,
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
