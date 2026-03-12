import { motion } from "motion/react";
import { staggerContainer, fadeInUp } from "@utils/animations";
import CodingPlatformCard from "./CodingPlatformCard";

interface CodingPlatformsSectionProps {
   platformEntries: [string, unknown][];
   isMobile: boolean;
}

const CodingPlatformsSection = ({
   platformEntries,
   isMobile,
}: CodingPlatformsSectionProps) => {
   if (platformEntries.length === 0) return null;

   return (
      <div>
         <motion.h3
            style={{
               fontSize: 20,
               fontWeight: 700,
               color: "#eeeef5",
               marginBottom: 24,
               textAlign: "center",
            }}
            variants={fadeInUp}
         >
            Coding Platforms
         </motion.h3>
         <motion.div
            style={{
               display: "grid",
               gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(240px, 1fr))",
               gap: 24,
            }}
            variants={staggerContainer}
         >
            {platformEntries.map(([platform, stats]) => (
               <CodingPlatformCard
                  key={platform}
                  platform={platform}
                  stats={stats as Record<string, unknown>}
               />
            ))}
         </motion.div>
      </div>
   );
};

export default CodingPlatformsSection;
