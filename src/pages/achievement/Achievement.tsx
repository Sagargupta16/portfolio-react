import { useMemo } from "react";
import {
   getCertifications,
   getLearningBadges,
   getAchievements,
} from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import { LEVEL_ORDER } from "./achievementConstants";
import CertBadgeShowcase from "./CertBadgeShowcase";
import BadgesSection from "./BadgesSection";
import CompetitionsSection from "./CompetitionsSection";

const Achievement = () => {
   const rawCertifications = useMemo(() => getCertifications(), []);
   const learningBadges = useMemo(() => getLearningBadges(), []);
   const achievements = useMemo(() => getAchievements(), []);

   const certifications = useMemo(
      () =>
         [...rawCertifications].sort(
            (a, b) =>
               (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99),
         ),
      [rawCertifications],
   );

   return (
      <PageSection
         id="achievements"
         title="Achievements"
         subtitle="Milestones & certifications"
      >
         <div
            style={{
               maxWidth: 1152,
               margin: "0 auto",
               display: "flex",
               flexDirection: "column",
               gap: 56,
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
