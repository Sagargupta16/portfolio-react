import { FaGithub } from "react-icons/fa6";
import type { CodingPlatformStat } from "@/types";
import { getStatsCopy } from "@data/personal";
import { newTabLabel } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import { MONO_FONT, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import ContributionCalendar from "./ContributionCalendar";
import SplitBar from "./SplitBar";
import { LANGUAGE_SHADES } from "./statsTokens";
import { Metrics, WideProfileCard } from "./WideProfileCard";

const count = (n = 0) => n.toLocaleString("en-US");
const COPY = getStatsCopy().platforms.github;

interface GitHubCardProps {
   username: string;
   stats?: CodingPlatformStat;
}

/** GitHub numbers as the profile README's stats card computes them, from the
 *  weekly sync (coding_platform_stats.github), over a live heatmap of the same
 *  year. The synced figures stay the headline even if the live total differs
 *  by a few. */
const GitHubCard = ({ username, stats }: Readonly<GitHubCardProps>) => {
   const languages = stats?.languages ?? [];

   return (
      <WideProfileCard
         area="github"
         icon={
            <FaGithub size={18} style={{ color: TEXT_PRIMARY }} aria-hidden />
         }
         label={COPY.label}
         color={TEXT_PRIMARY}
         meta={`@${username}`}
         href={stats?.url ?? `https://github.com/${username}`}
         linkLabel={newTabLabel(fillTemplate(COPY.profile_label, { username }))}
      >
         {stats?.fetched && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
               <Metrics
                  items={[
                     {
                        value: count(stats.contributions),
                        label: COPY.contributions,
                     },
                     {
                        value: count(stats.pull_requests),
                        label: COPY.pull_requests,
                     },
                     {
                        value: fillTemplate(COPY.streak_value, {
                           days: stats.longest_streak ?? 0,
                        }),
                        label: COPY.longest_streak,
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
                  {fillTemplate(COPY.updated, { date: stats.fetched })}
               </span>
            </div>
         )}
         <ContributionCalendar username={username} />
         {languages.length > 0 && (
            <SplitBar
               heading={COPY.languages}
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
