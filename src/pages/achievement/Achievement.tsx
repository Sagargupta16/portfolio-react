import { useMemo } from "react";
import {
   getCertifications,
   getLearningBadges,
   getAchievements,
} from "@data/dataLoader";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import { LEVEL_ORDER } from "./achievementConstants";
import CertificationsSection from "./CertificationsSection";
import BadgesSection from "./BadgesSection";
import CompetitionsSection from "./CompetitionsSection";

const Achievement = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
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
            <CertificationsSection certifications={certifications} />
            <BadgesSection badges={learningBadges} />
            <CompetitionsSection
               achievements={achievements}
               isMobile={isMobile}
            />
         </div>
      </PageSection>
   );
};

export default Achievement;
