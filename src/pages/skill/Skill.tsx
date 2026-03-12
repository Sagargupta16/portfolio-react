import { useMemo } from "react";
import { motion } from "motion/react";

import { getSkills } from "@data/dataLoader";
import type { SkillsData } from "@/types";
import {
   sectionRevealEnhanced,
   staggerContainer,
   staggerItem,
   waveCascadeContainer,
   waveCascadeItem,
} from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";

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

interface SkillTagGroupProps {
   items: string[];
}

const SkillTagGroup = ({ items }: SkillTagGroupProps) => (
   <motion.div
      className="flex flex-wrap gap-2.5"
      style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
      variants={waveCascadeContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "0px 0px -100px 0px" }}
   >
      {items.map((skill) => (
         <motion.span
            key={skill}
            className="skill-tag"
            variants={waveCascadeItem}
         >
            {skill}
         </motion.span>
      ))}
   </motion.div>
);

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

            {/* Secondary Categories */}
            {secondaryCategories.length > 0 && (
               <motion.div
                  style={{
                     marginTop: 56,
                     display: "flex",
                     flexDirection: "column",
                     gap: 32,
                  }}
                  variants={staggerContainer}
               >
                  <div
                     className="section-divider"
                     style={{
                        height: 1,
                        background:
                           "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.04) 20%, rgba(6,182,212,0.3) 50%, rgba(255,255,255,0.04) 80%, transparent 95%)",
                     }}
                  />
                  <h3
                     style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#eeeef5",
                        textAlign: "center",
                     }}
                  >
                     Other Skills
                  </h3>
                  {secondaryCategories.map(({ key, label, items }) => (
                     <motion.div key={key} variants={staggerItem}>
                        <h4
                           style={{
                              fontSize: 16,
                              fontWeight: 500,
                              color: "#a5a5c0",
                              marginBottom: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                           }}
                        >
                           <div
                              style={{
                                 height: 20,
                                 width: 3,
                                 borderRadius: 9999,
                                 background:
                                    "linear-gradient(to bottom, #a855f7, rgba(168,85,247,0.3))",
                              }}
                           />
                           {label}
                        </h4>
                        <div
                           style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                           {items.map((skill) => (
                              <span
                                 key={skill}
                                 className="skill-tag"
                                 style={{
                                    fontSize: 12,
                                    padding: "5px 14px",
                                 }}
                              >
                                 {skill}
                              </span>
                           ))}
                        </div>
                     </motion.div>
                  ))}
               </motion.div>
            )}
         </div>
      </motion.section>
   );
};

export default Skill;
