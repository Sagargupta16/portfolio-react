import { useMemo } from "react";
import {
   getCertifications,
   getLearningBadges,
   getAchievements,
} from "@data/achievements";
import { getSectionCopy } from "@data/sections";
import PageSection from "@components/layout/PageSection";
import { MAX_WIDTH } from "@/constants/theme";
import { LEVEL_ORDER } from "./achievementConstants";
import CertBadgeShowcase from "./CertBadgeShowcase";
import BadgesSection from "./BadgesSection";
import CompetitionsSection from "./CompetitionsSection";

const Achievement = () => {
   const { title, subtitle } = getSectionCopy("achievements");
   const rawCertifications = useMemo(() => getCertifications(), []);
   const learningBadges = useMemo(() => getLearningBadges(), []);
   const achievements = useMemo(() => getAchievements(), []);

   const certifications = useMemo(
      () =>
         [...rawCertifications].sort(
            (a, b) =>
               (LEVEL_ORDER[a.level ?? ""] ?? 99) -
               (LEVEL_ORDER[b.level ?? ""] ?? 99),
         ),
      [rawCertifications],
   );

   return (
      <PageSection id="achievements" title={title} subtitle={subtitle}>
         <div
            style={{
               maxWidth: MAX_WIDTH,
               margin: "0 auto",
               display: "flex",
               flexDirection: "column",
               gap: 48,
            }}
         >
            <CertBadgeShowcase certifications={certifications} />
            <BadgesSection badges={learningBadges} />
            <CompetitionsSection achievements={achievements} />
         </div>
      </PageSection>
   );
};

export default Achievement;
