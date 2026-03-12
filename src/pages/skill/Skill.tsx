import { useMemo } from "react";
import { motion } from "motion/react";
import { getSkills } from "@data/dataLoader";
import type { SkillsData } from "@/types";
import {
   sectionRevealEnhanced,
   staggerContainer,
   staggerItem,
} from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";
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
   const isMobile = useMediaQuery("(max-width: 768px)");
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
      <motion.section
         id="skills"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
         variants={sectionRevealEnhanced}
      >
         <div
            className="max-w-6xl mx-auto"
            style={{ maxWidth: 1152, margin: "0 auto" }}
         >
            <SectionHeader
               title="Skills & Technologies"
               subtitle="What I work with"
            />

            <motion.div
               className="space-y-12"
               style={{ display: "flex", flexDirection: "column", gap: 48 }}
               variants={staggerContainer}
            >
               {primaryCategories.map(({ key, label, items }) => (
                  <motion.div key={key} variants={staggerItem}>
                     <h3
                        className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3"
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
                           className="h-6 w-1 rounded-full bg-gradient-to-b from-accent-cyan to-accent-cyan/30"
                           style={{
                              height: 24,
                              width: 4,
                              borderRadius: 9999,
                              background:
                                 "linear-gradient(to bottom, #06b6d4, rgba(6,182,212,0.3))",
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
      </motion.section>
   );
};

export default Skill;
