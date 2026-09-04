import { useMemo } from "react";
import { motion } from "motion/react";
import {
   getCertifications,
   getExperience,
   getImpact,
   getLearningBadges,
   getOpenSourceContributions,
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import useBreakpoint from "@hooks/useBreakpoint";

/* The site's only numeric summary -- the hero deliberately carries no figures.
   Coding-platform numbers are NOT here: they live with the platform cards below
   (CodingProfiles), which show them per platform with profile links. Every value
   is derived from data/*.json rather than written here, so the counts cannot
   drift away from the underlying entries. */

interface Stat {
   value: string;
   label: string;
   note?: string;
}

const StatTile = ({ stat, isMobile }: { stat: Stat; isMobile: boolean }) => (
   <motion.div
      variants={staggerItem}
      style={{
         display: "flex",
         flexDirection: "column",
         gap: 6,
         padding: isMobile ? "16px 14px" : "20px 18px",
         borderRadius: 16,
         border: "1px solid rgb(255 255 255 / 0.06)",
         background: "var(--color-bg-card)",
         minWidth: 0,
      }}
   >
      <AnimatedCounter value={stat.value} />
      <span
         style={{
            fontFamily: MONO_FONT,
            fontSize: 10,
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
      <p className="dashed-rule">{heading}</p>
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

   const { impact, delivery } = useMemo(() => {
      const certs = getCertifications();
      const badges = getLearningBadges();
      const oss = getOpenSourceContributions();
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
      const mergedCount = oss.filter((pr) => pr.status === "merged").length;

      return {
         impact: [
            {
               value: impactData.clients_served,
               label: "Clients served",
               note: impactData.clients_note,
            },
            {
               value: impactData.workloads_migrated,
               label: "Workloads migrated",
               note: `Into ${impactData.aws_accounts} AWS accounts`,
            },
            {
               value: impactData.security_controls,
               label: "Security controls",
               note: "CCM v4.0 aligned",
            },
            {
               value: String(speakingCount),
               label: "Talks & patterns",
               note: "Published org-wide at AWS",
            },
         ] satisfies Stat[],
         delivery: [
            {
               value: String(projectCount),
               label: "Projects shipped",
               note: `${featuredCount} featured`,
            },
            {
               value: String(certs.length),
               label: "Certifications",
               note: "AWS + HashiCorp",
            },
            {
               value: String(badges.length),
               label: "AWS badges",
               note: "Knowledge & learning",
            },
            {
               value: String(mergedCount),
               label: "Upstream PRs merged",
               note: `of ${oss.length} raised`,
            },
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
         {/* Consulting impact leads: it is the work clients and recruiters
             are actually assessing. */}
         <StatGroup
            heading="Consulting impact"
            stats={impact}
            isMobile={isMobile}
         />
         <StatGroup
            heading="Delivery & credentials"
            stats={delivery}
            isMobile={isMobile}
         />
      </div>
   );
};

export default StatsBand;
