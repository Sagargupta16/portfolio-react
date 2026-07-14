import { useMemo } from "react";
import { motion } from "motion/react";
import { getSkills } from "@data/dataLoader";
import type { SkillsData } from "@/types";
import { staggerContainer, staggerItem } from "@utils/animations";
import { MAX_WIDTH } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import SkillTagGroup from "./SkillTagGroup";
import SecondarySkills from "./SecondarySkills";

// Display order leads with the strongest positioning (DevOps/MLOps @ AWS),
// mirroring the hero badge -- not alphabetical, not stack-conventional.
const CATEGORY_CONFIG: Record<string, string> = {
   cloud_devops: "Cloud & DevOps",
   ai_ml: "AI / Machine Learning",
   languages: "Languages",
   backend: "Backend & Databases",
   frontend: "Frontend",
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
         <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
            <motion.div
               style={{ display: "flex", flexDirection: "column", gap: 56 }}
               variants={staggerContainer}
            >
               {primaryCategories.map(({ key, label, items }) => (
                  <motion.div key={key} variants={staggerItem}>
                     <h3 className="dashed-rule" style={{ marginBottom: 28 }}>
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
