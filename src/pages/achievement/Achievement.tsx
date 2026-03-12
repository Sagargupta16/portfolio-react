import { useMemo } from "react";
import { motion } from "motion/react";
import {
   getCertifications,
   getLearningBadges,
   getAchievements,
   getCodingPlatformStats,
} from "@data/dataLoader";
import { sectionRevealEnhanced } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";
import { LEVEL_ORDER } from "./achievementConstants";
import CertificationsSection from "./CertificationsSection";
import BadgesSection from "./BadgesSection";
import CodingPlatformsSection from "./CodingPlatformsSection";
import CompetitionsSection from "./CompetitionsSection";

const Achievement = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const rawCertifications = useMemo(() => getCertifications(), []);
   const learningBadges = useMemo(() => getLearningBadges(), []);
   const achievements = useMemo(() => getAchievements(), []);
   const codingStats = useMemo(() => getCodingPlatformStats(), []);
   const platformEntries = useMemo(
      () => Object.entries(codingStats),
      [codingStats],
   );

   const certifications = useMemo(
      () =>
         [...rawCertifications].sort(
            (a, b) =>
               (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99),
         ),
      [rawCertifications],
   );

   return (
      <motion.section
         id="achievements"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
         variants={sectionRevealEnhanced}
      >
         <SectionHeader
            title="Achievements"
            subtitle="Milestones & certifications"
         />

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
            <CodingPlatformsSection
               platformEntries={platformEntries}
               isMobile={isMobile}
            />
            <CompetitionsSection
               achievements={achievements}
               isMobile={isMobile}
            />
         </div>
      </motion.section>
   );
};

export default Achievement;
