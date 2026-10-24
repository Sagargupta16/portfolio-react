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
   getCommunityDiscussions,
   getOpenSourceContributions,
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/projects";
import { staggerContainer, staggerItem } from "@utils/animations";
import { isCertActive } from "@utils/certStatus";
import { fillTemplate, type TemplateValues } from "@utils/fillTemplate";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import type { StatsTileKey } from "@/types";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import useBreakpoint from "@hooks/useBreakpoint";

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
}

// The repos tile note says "10k+"; keep the two in step.
const BIG_REPO_STARS = 10_000;

// Credly issuer names are long ("Amazon Web Services Training and
// Certification", "AWS Worldwide Field Enablement"); the tiles need one word.
const shortIssuer = (issuer: string) =>
   /amazon web services|^aws\b/i.test(issuer) ? "AWS" : issuer.split(" ")[0];

/** 234448 -> "234k+", 442 -> "442". AnimatedCounter keeps "k+" as suffix. */
const formatStars = (n: number): string =>
   n >= 1000 ? `${Math.floor(n / 1000)}k+` : String(n);

const StatTile = ({ stat, isMobile }: { stat: Stat; isMobile: boolean }) => (
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
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
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
         {stats.map((stat) => (
            <StatTile key={stat.label} stat={stat} isMobile={isMobile} />
         ))}
      </motion.div>
   </div>
);

const StatsBand = () => {
   const { isMobile } = useBreakpoint();
   const { headings } = getStatsCopy();

   const { impact, delivery, openSource, competitive } = useMemo(() => {
      // A tile's label and note come from the data; `values` fills the note.
      const { tiles } = getStatsCopy();
      const tile = (
         key: StatsTileKey,
         value: string,
         values?: TemplateValues,
      ): Stat => {
         const { label, note } = tiles[key];
         return { value, label, note: note && fillTemplate(note, values) };
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

      // Talks and published patterns are tagged by `type` on the experience
      // entries, so this count tracks the timeline instead of restating it.
      const internal = getExperience().flatMap(
         (job) => job.internal_contributions ?? [],
      );
      const speakingCount = internal.filter(
         (c) => c.type === "talk" || c.type === "publication",
      ).length;

      const projectCount =
         getFeaturedProjects().length +
         getCollaborativeProjects().length +
         getOtherProjects().length +
         getCommunityProjects().length;
      const featuredCount = getFeaturedProjects().length;

      // Podium = 1st/2nd/3rd place entries in the Awards data.
      const podium = getAchievements().filter((a) =>
         /^(1st|2nd|3rd) Place/.test(a.title),
      );
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
      const solvedCount = (value?: string) =>
         Number.parseInt(value ?? "", 10) || 0;
      const solvedTotal =
         solvedCount(leetcode?.problems_solved) +
         solvedCount(gfg?.problems_solved);

      return {
         impact: [
            {
               ...tile("clients_served", impactData.clients_served),
               note: impactData.clients_note,
            },
            tile("terraform_resources", impactData.terraform_resources, {
               workspaces: impactData.terraform_workspaces,
            }),
            tile("security_controls", impactData.security_controls),
            tile("talks", String(speakingCount)),
         ] satisfies Stat[],
         delivery: [
            tile("projects", String(projectCount), { featured: featuredCount }),
            {
               ...tile("certifications", String(certs.length)),
               note: certIssuers.join(" + "),
            },
            {
               ...tile("badges", String(badges.length)),
               note: badgeNote,
            },
            tile("podium", String(podium.length), {
               first: place("1st"),
               second: place("2nd"),
               third: place("3rd"),
            }),
         ] satisfies Stat[],
         competitive: [
            tile("leetcode_rating", leetcode?.best_rating ?? "", {
               badge: leetcode?.badge,
               top: leetcode?.top_percentage,
            }),
            tile("problems_solved", `${solvedTotal}+`, {
               leetcode: leetcode?.problems_solved,
               gfg: gfg?.problems_solved,
            }),
            tile("contests", leetcode?.contests ?? "", {
               rank: leetcode?.best_contest_rank,
            }),
            tile("hard_solved", leetcode?.hard_solved ?? ""),
         ] satisfies Stat[],
         openSource: [
            { ...tile("merged_prs", String(mergedPrs)), note: mergedNote },
            tile("stars", formatStars(starsReached)),
            tile("repos", String(repoStars.size), { big: bigRepos }),
            tile("answers", String(discussions.length), {
               accepted,
               helpful: discussions.length - accepted,
            }),
         ] satisfies Stat[],
      };
   }, []);

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
            stats={getHighlights()}
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
