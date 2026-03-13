import { useMemo } from "react";
import { getSkills } from "@data/dataLoader";
import type { SkillsData } from "@/types";
import PageSection from "@components/layout/PageSection";
import SkillBrowser from "./SkillBrowser";
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
            <SkillBrowser categories={primaryCategories} />
            <SecondarySkills categories={secondaryCategories} />
         </div>
      </PageSection>
   );
};

export default Skill;
