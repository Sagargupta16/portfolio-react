import { useMemo } from "react";
import { motion } from "motion/react";
import {
   getAchievements,
   getCertifications,
   getCodingPlatformStats,
   getLearningBadges,
} from "@data/achievements";
import { getExperience } from "@data/experience";
import { getHighlights, getImpact, getStatsCopy } from "@data/personal";
import {
   getAllProjects,
   getCommunityDiscussions,
   getOpenSourceContributions,
   getFeaturedProjects,
} from "@data/projects";
import {
   staggerContainer,
   staggerItem,
   VIEWPORT_MARGIN,
} from "@utils/animations";
import { isCertActive } from "@utils/certStatus";
import { fillTemplate, type TemplateValues } from "@utils/fillTemplate";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import type { Highlight, StatsTileKey } from "@/types";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import useBreakpoint from "@hooks/useBreakpoint";
import { isPodium } from "@pages/achievement/achievementConstants";
import StatFigure from "./StatFigure";
import {
   bars,
   chevrons,
   curve,
   glyphs,
   heat,
   hexes,
   nodes,
   pips,
   podiumSteps,
   rail,
   ruler,
   split,
   spokes,
   tally,
   tiers,
   waffle,
   years,
   type Figure,
} from "./tileFigures";

/* The site's only numeric summary -- the hero deliberately carries no figures.
   Highlights lead: the strongest sourced results, kept in personal.json
   highlights (validate-data.js checks the counts among them against the
   entries they restate). The competitive-programming group reads the same
   coding_platform_stats entries as the platform cards below (CodingProfiles),
   which repeat them per platform with profile links, so the two surfaces
   cannot disagree. Every value is derived from data/*.json rather than
   written here, so the counts cannot drift away from the underlying entries.
   The headings, labels and notes are personal.json `stats` copy. */

interface Stat {
   value: string;
   label: string;
   note?: string;
   /** Small flat picture of this tile's own number (tileFigures). */
   figure?: Figure;
}

// The repos tile note says "10k+"; keep the two in step.
const BIG_REPO_STARS = 10_000;

// A tile's figure starts as the tile's own reveal settles, one tile after
// another like the tiles themselves (staggerContainer's 0.06 s).
const FIGURE_DELAY = 0.3;
const FIGURE_STAGGER = 0.06;

/** "7x" -> 7, "2+" -> 2, "1300+" -> 1300; anything else -> 0. */
const countOf = (value?: string) => Number.parseInt(value ?? "", 10) || 0;

/** LeetCode contest ratings, oldest first (the platform card's history). */
const leetcodeRatings = () =>
   (getCodingPlatformStats().leetcode?.rating_history ?? []).map(
      ([, rating]) => rating,
   );

/** Highlights carry no tile key, so the figure follows the fact a highlight
 *  restates (`derived_from`); one without it is a plain count of nodes. */
const highlightFigure = (
   { value, derived_from }: Highlight,
   ratings: number[],
) => {
   const count = countOf(value);
   switch (derived_from) {
      case "aws_samples":
         return glyphs(["repo", count]);
      case "tfc_ambassador":
         return pips(count);
      case "leetcode_peak":
         return curve(ratings);
      default:
         return nodes(count);
   }
};

// Credly issuer names are long ("Amazon Web Services Training and
// Certification", "AWS Worldwide Field Enablement"); the tiles need one word.
const shortIssuer = (issuer: string) =>
   /amazon web services|^aws\b/i.test(issuer) ? "AWS" : issuer.split(" ")[0];

/** 234448 -> "234k+", 442 -> "442". AnimatedCounter keeps "k+" as suffix. */
const formatStars = (n: number): string =>
   n >= 1000 ? `${Math.floor(n / 1000)}k+` : String(n);

const StatTile = ({
   stat,
   index,
   isMobile,
}: {
   stat: Stat;
   index: number;
   isMobile: boolean;
}) => (
   <motion.div
      variants={staggerItem}
      style={{
         display: "flex",
         flexDirection: "column",
         gap: 6,
         padding: isMobile ? "16px 14px" : "20px 18px",
         borderRadius: 16,
         border: "1px solid rgb(var(--ch-white) / 0.06)",
         background: "var(--color-bg-card)",
         minWidth: 0,
      }}
   >
      {/* Its own row above the number, so wide values (1800+, 236k+) never
          crowd it on a 375px phone, where tiles sit two to a row. */}
      <StatFigure
         figure={stat.figure}
         delay={FIGURE_DELAY + index * FIGURE_STAGGER}
         height={isMobile ? 20 : 24}
      />
      <AnimatedCounter value={stat.value} />
      <span
         style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TEXT_SECONDARY,
         }}
      >
         {stat.label}
      </span>
      {stat.note && (
         <span style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.4 }}>
            {stat.note}
         </span>
      )}
   </motion.div>
);

const StatGroup = ({
   heading,
   stats,
   isMobile,
}: {
   heading: string;
   stats: Stat[];
   isMobile: boolean;
}) => (
   <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h3 className="dashed-rule">{heading}</h3>
      <motion.div
         variants={staggerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         style={{
            display: "grid",
            // minmax(0, 1fr) on mobile so long mono values can shrink instead
            // of blowing the track out (see CLAUDE.md mobile-grid gotcha).
            gridTemplateColumns: isMobile
               ? "repeat(2, minmax(0, 1fr))"
               : "repeat(auto-fit, minmax(170px, 1fr))",
            gap: isMobile ? 12 : 16,
         }}
      >
         {stats.map((stat, index) => (
            <StatTile
               key={stat.label}
               stat={stat}
               index={index}
               isMobile={isMobile}
            />
         ))}
      </motion.div>
   </div>
);

const StatsBand = () => {
   const { isMobile } = useBreakpoint();
   const { headings } = getStatsCopy();

   const band = useMemo(() => {
      // A tile's label and note come from the data; `values` fills the note.
      // Its figure is drawn from the same derived numbers as its value.
      const { tiles } = getStatsCopy();
      const tile = (
         key: StatsTileKey,
         value: string,
         figure: Figure | undefined,
         values?: TemplateValues,
      ): Stat => {
         const { label, note } = tiles[key];
         return {
            value,
            label,
            note: note && fillTemplate(note, values),
            figure,
         };
      };

      // Expired certifications drop out of the count, and both notes name the
      // issuers that are actually there (a lapsed cert stops adding its issuer).
      const certs = getCertifications().filter((c) => isCertActive(c));
      const certIssuers = [...new Set(certs.map((c) => shortIssuer(c.issuer)))];
      const badges = getLearningBadges();
      const badgeIssuers = new Map<string, number>();
      for (const badge of badges) {
         const issuer = shortIssuer(badge.issuer);
         badgeIssuers.set(issuer, (badgeIssuers.get(issuer) ?? 0) + 1);
      }
      const badgeNote = [...badgeIssuers]
         .map(([issuer, count]) => `${count} ${issuer}`)
         .join(", ");
      const impactData = getImpact();

      // Talks and published samples are tagged by `type` on the experience
      // entries, so this count tracks the timeline instead of restating it.
      // One generic line can stand for several talks (`count`).
      const internal = getExperience().flatMap(
         (job) => job.internal_contributions ?? [],
      );
      const countType = (type: string) =>
         internal
            .filter((c) => c.type === type)
            .reduce((sum, c) => sum + (c.count ?? 1), 0);
      const talkCount = countType("talk");
      const sampleCount = countType("publication");
      const speakingCount = talkCount + sampleCount;
      const speakerCerts = getExperience()
         .flatMap((job) => job.internal_achievements ?? [])
         .filter((a) => /Speaker Certification/.test(a.title)).length;

      const projectCount = getAllProjects().length;
      const featuredCount = getFeaturedProjects().length;

      // Podium = 1st/2nd/3rd place entries in the Awards data.
      const podium = getAchievements().filter((a) => isPodium(a.title));
      const place = (n: string) =>
         podium.filter((a) => a.title.startsWith(n)).length;

      // Open source: "merged" entries can be PRs or a credited commit, so the
      // PR count is the strict figure and co-authored fixes are noted separately.
      const oss = getOpenSourceContributions();
      const merged = oss.filter((c) => c.status === "merged");
      const mergedPrs = merged.filter((c) => c.url.includes("/pull/")).length;
      const coAuthored = merged.length - mergedPrs;
      // Repos with a merged entry only: an open or closed-unmerged PR is not
      // a contribution the stars, repo count or 10k+ tally may claim.
      const repoStars = new Map<string, number>();
      for (const contribution of merged) {
         if (!repoStars.has(contribution.repo)) {
            repoStars.set(contribution.repo, contribution.stars);
         }
      }
      const prsTile = tiles.merged_prs;
      let mergedNote = fillTemplate(prsTile.note ?? "", {
         repos: repoStars.size,
      });
      if (coAuthored === 1) mergedNote = prsTile.note_coauthored_one;
      else if (coAuthored > 1)
         mergedNote = fillTemplate(prsTile.note_coauthored_many, {
            count: coAuthored,
         });
      const starsReached = [...repoStars.values()].reduce(
         (sum, stars) => sum + stars,
         0,
      );
      const bigRepos = [...repoStars.values()].filter(
         (s) => s >= BIG_REPO_STARS,
      ).length;
      const discussions = getCommunityDiscussions();
      const accepted = discussions.filter(
         (d) => d.status === "accepted",
      ).length;

      // Competitive programming: LeetCode and GeeksforGeeks are the two
      // platforms that report a problem count, so the combined tile sums those
      // and names each contribution in its note. HackerRank reports stars.
      const platforms = getCodingPlatformStats();
      const leetcode = platforms.leetcode;
      const gfg = platforms.geeksforgeeks;
      const leetcodeSolved = countOf(leetcode?.problems_solved);
      const gfgSolved = countOf(gfg?.problems_solved);
      const solvedTotal = leetcodeSolved + gfgSolved;
      // The contests tile shades one cell per contest by the rating it ended
      // on, but only when the history covers every contest the tile counts.
      const ratings = leetcodeRatings();
      const contests = countOf(leetcode?.contests);
      const contestCells =
         ratings.length === contests ? heat(ratings) : split(contests, 0);
      // The hard tile's bars: easy, medium and hard solved, to one scale.
      const solved = leetcode?.solved_by_difficulty;
      const difficultySplit = solved
         ? [solved.easy, solved.medium, solved.hard]
         : [];

      return {
         highlights: getHighlights().map((highlight): Stat => ({
            value: highlight.value,
            label: highlight.label,
            note: highlight.note,
            figure: highlightFigure(highlight, ratings),
         })),
         impact: [
            {
               ...tile(
                  "clients_served",
                  impactData.clients_served,
                  spokes(countOf(impactData.clients_served)),
               ),
               note: impactData.clients_note,
            },
            tile(
               "years_at_aws",
               impactData.years_at_aws,
               years(
                  countOf(impactData.years_at_aws),
                  impactData.years_at_aws.includes("+"),
               ),
            ),
            tile("speaker_certs", String(speakerCerts), chevrons(speakerCerts)),
            tile(
               "talks",
               String(speakingCount),
               glyphs(["talk", talkCount], ["repo", sampleCount]),
            ),
         ] satisfies Stat[],
         delivery: [
            tile(
               "projects",
               String(projectCount),
               waffle(split(projectCount, featuredCount)),
               { featured: featuredCount },
            ),
            {
               ...tile(
                  "certifications",
                  String(certs.length),
                  glyphs(["cert", certs.length]),
               ),
               note: certIssuers.join(" + "),
            },
            {
               ...tile("badges", String(badges.length), hexes(badges.length)),
               note: badgeNote,
            },
            tile(
               "podium",
               String(podium.length),
               podiumSteps([place("1st"), place("2nd"), place("3rd")]),
               {
                  first: place("1st"),
                  second: place("2nd"),
                  third: place("3rd"),
               },
            ),
         ] satisfies Stat[],
         competitive: [
            tile(
               "leetcode_rating",
               leetcode?.best_rating ?? "",
               ruler(Number.parseFloat(leetcode?.top_percentage ?? "")),
               { badge: leetcode?.badge, top: leetcode?.top_percentage },
            ),
            tile(
               "problems_solved",
               `${solvedTotal}+`,
               tally([leetcodeSolved, gfgSolved]),
               {
                  leetcode: leetcode?.problems_solved,
                  gfg: gfg?.problems_solved,
               },
            ),
            tile("contests", leetcode?.contests ?? "", waffle(contestCells), {
               rank: leetcode?.best_contest_rank,
            }),
            tile(
               "hard_solved",
               leetcode?.hard_solved ?? "",
               tiers(difficultySplit),
            ),
         ] satisfies Stat[],
         openSource: [
            {
               ...tile(
                  "merged_prs",
                  String(mergedPrs),
                  rail(mergedPrs, coAuthored),
               ),
               note: mergedNote,
            },
            tile(
               "stars",
               formatStars(starsReached),
               bars([...repoStars.values()]),
            ),
            tile(
               "repos",
               String(repoStars.size),
               // the 10k+ repos lead, solid; the rest are rings
               pips(repoStars.size, bigRepos),
               { big: bigRepos },
            ),
            tile(
               "answers",
               String(discussions.length),
               waffle(split(discussions.length, accepted)),
               { accepted, helpful: discussions.length - accepted },
            ),
         ] satisfies Stat[],
      };
   }, []);
   const { highlights, impact, delivery, openSource, competitive } = band;

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 32 : 44,
            marginBottom: isMobile ? 48 : 64,
         }}
      >
         {/* Highlights, then consulting impact: the work clients and
             recruiters are actually assessing comes first. */}
         <StatGroup
            heading={headings.highlights}
            stats={highlights}
            isMobile={isMobile}
         />
         <StatGroup
            heading={headings.impact}
            stats={impact}
            isMobile={isMobile}
         />
         <StatGroup
            heading={headings.delivery}
            stats={delivery}
            isMobile={isMobile}
         />
         <StatGroup
            heading={headings.open_source}
            stats={openSource}
            isMobile={isMobile}
         />
         {/* Competitive programming closes the band and leads into the
             platform cards further down the section. */}
         <StatGroup
            heading={headings.competitive}
            stats={competitive}
            isMobile={isMobile}
         />
      </div>
   );
};

export default StatsBand;
