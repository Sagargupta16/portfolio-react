import { useMemo } from "react";
import { motion } from "motion/react";
import { getSkills } from "@data/dataLoader";
import type { SkillsData } from "@/types";
import { staggerContainer, staggerItem } from "@utils/animations";
import { CYAN } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import SkillTagGroup from "./SkillTagGroup";
import SecondarySkills from "./SecondarySkills";

const CATEGORY_CONFIG: Record<string, string> = {
   languages: "Languages",
   frontend: "Frontend",
   backend: "Backend & Databases",
   cloud_devops: "Cloud & DevOps",
   ai_ml: "AI / Machine Learning",
   tools_platforms: "Tools & Platforms",
};

const SECONDARY_CATEGORIES: string[] = [
   "cs_fundamentals",
   "soft_skills",
   "areas_of_interest",
];

const Skill = () => {
   const skills: SkillsData = getSkills();

   const primaryCategories = useMemo(
      () =>
         Object.entries(CATEGORY_CONFIG)
            .filter(([key]) => key in skills)
            .map(([key, label]) => ({
               key,
               label,
               items: skills[key as keyof SkillsData],
            })),
      [skills],
   );

   const secondaryCategories = useMemo(
      () =>
         SECONDARY_CATEGORIES.filter((key) => key in skills).map((key) => ({
            key,
            label: key
               .replaceAll("_", " ")
               .replaceAll(/\b\w/g, (c) => c.toUpperCase()),
            items: skills[key as keyof SkillsData],
         })),
      [skills],
   );

   return (
      <PageSection
         id="skills"
         title="Skills & Technologies"
         subtitle="What I work with"
      >
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <motion.div
               style={{ display: "flex", flexDirection: "column", gap: 48 }}
               variants={staggerContainer}
            >
               {primaryCategories.map(({ key, label, items }) => (
                  <motion.div key={key} variants={staggerItem}>
                     <h3
                        style={{
                           fontSize: 18,
                           fontWeight: 600,
                           color: "#eeeef5",
                           marginBottom: 16,
                           display: "flex",
                           alignItems: "center",
                           gap: 12,
                        }}
                     >
                        <div
                           style={{
                              height: 24,
                              width: 4,
                              borderRadius: 9999,
                              background: `linear-gradient(to bottom, ${CYAN}, ${CYAN}4d)`,
                           }}
                        />
                        {label}
                     </h3>
                     <SkillTagGroup items={items} />
                  </motion.div>
               ))}
            </motion.div>

            <SecondarySkills categories={secondaryCategories} />
         </div>
      </PageSection>
   );
};

export default Skill;
