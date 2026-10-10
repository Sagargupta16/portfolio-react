import { FaGithub } from "react-icons/fa6";
import type { CodingPlatformStat } from "@/types";
import { MONO_FONT, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import SplitBar from "./SplitBar";
import { LANGUAGE_SHADES } from "./statsTokens";
import { Metrics, WideProfileCard } from "./WideProfileCard";

const count = (n = 0) => n.toLocaleString("en-US");

interface GitHubCardProps {
   username: string;
   stats?: CodingPlatformStat;
}

/** GitHub numbers as the profile README's stats card computes them, from the
 *  weekly sync (coding_platform_stats.github). */
const GitHubCard = ({ username, stats }: Readonly<GitHubCardProps>) => {
   const languages = stats?.languages ?? [];

   return (
      <WideProfileCard
         area="github"
         icon={
            <FaGithub size={18} style={{ color: TEXT_PRIMARY }} aria-hidden />
         }
         label="GitHub"
         color={TEXT_PRIMARY}
         meta={`@${username}`}
         href={stats?.url ?? `https://github.com/${username}`}
         linkLabel={`GitHub profile @${username} (opens in a new tab)`}
      >
         {stats?.fetched && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
               <Metrics
                  items={[
                     {
                        value: count(stats.contributions),
                        label: "Contributions",
                     },
                     {
                        value: count(stats.pull_requests),
                        label: "Pull requests",
                     },
                     {
                        value: `${stats.longest_streak ?? 0} days`,
                        label: "Longest streak",
                     },
                  ]}
               />
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_MUTED,
                  }}
               >
                  {`In the last year | updated ${stats.fetched}`}
               </span>
            </div>
         )}
         {languages.length > 0 && (
            <SplitBar
               heading="Top languages by code size"
               segments={languages.map((language, i) => ({
                  key: language.name,
                  label: language.name,
                  weight: language.percent,
                  display: `${language.percent}%`,
                  color: LANGUAGE_SHADES[i % LANGUAGE_SHADES.length],
               }))}
            />
         )}
      </WideProfileCard>
   );
};

export default GitHubCard;
