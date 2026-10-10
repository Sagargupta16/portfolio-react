import { useMemo } from "react";
import {
   BookOpen,
   Bot,
   Braces,
   Brain,
   Cloud,
   Compass,
   Database,
   HeartHandshake,
   PanelsTopLeft,
   Workflow,
   Wrench,
} from "lucide-react";
import { getSkills } from "@data/skills";
import type { SkillsData } from "@/types";
import { MAX_WIDTH } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import SkillCategory, { type CategoryGlyph } from "./SkillCategory";
import SecondarySkills from "./SecondarySkills";

interface CategoryConfig {
   label: string;
   glyph: CategoryGlyph;
   /** Rails the category spreads over in Full mode; AWS is long enough for two. */
   rails: number;
}

// Display order leads with the strongest positioning (DevOps/MLOps @ AWS),
// mirroring the hero badge -- not alphabetical, not stack-conventional. Every
// AWS service sits in the one AWS category.
const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
   aws: { label: "AWS", glyph: Cloud, rails: 2 },
   devops: { label: "DevOps & IaC", glyph: Workflow, rails: 1 },
   ai_ml: { label: "AI / Machine Learning", glyph: Brain, rails: 1 },
   ai_tools: { label: "AI Developer Tools", glyph: Bot, rails: 1 },
   languages: { label: "Languages", glyph: Braces, rails: 1 },
   backend: { label: "Backend & Databases", glyph: Database, rails: 1 },
   frontend: { label: "Frontend", glyph: PanelsTopLeft, rails: 1 },
   tools_platforms: { label: "Tools & Platforms", glyph: Wrench, rails: 1 },
};

// Labels derive from the key; only the glyph is configured.
const SECONDARY_GLYPHS: Record<string, CategoryGlyph> = {
   cs_fundamentals: BookOpen,
   soft_skills: HeartHandshake,
   areas_of_interest: Compass,
};

const Skill = () => {
   const skills: SkillsData = getSkills();

   const primaryCategories = useMemo(() => {
      let railOffset = 0;
      return Object.entries(CATEGORY_CONFIG)
         .filter(([key]) => key in skills)
         .map(([key, { label, glyph, rails }]) => {
            const category = {
               key,
               label,
               glyph,
               rails,
               railOffset,
               items: skills[key as keyof SkillsData],
            };
            railOffset += rails;
            return category;
         });
   }, [skills]);

   const secondaryCategories = useMemo(
      () =>
         Object.entries(SECONDARY_GLYPHS)
            .filter(([key]) => key in skills)
            .map(([key, glyph]) => ({
               key,
               label: key
                  .replaceAll("_", " ")
                  .replaceAll(/\b\w/g, (c) => c.toUpperCase()),
               glyph,
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
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
               {primaryCategories.map(
                  ({ key, label, glyph, items, rails, railOffset }, index) => (
                     <SkillCategory
                        key={key}
                        label={label}
                        glyph={glyph}
                        items={items}
                        index={index}
                        rails={rails}
                        railOffset={railOffset}
                        breathe
                     />
                  ),
               )}
            </div>

            <SecondarySkills categories={secondaryCategories} />
         </div>
      </PageSection>
   );
};

export default Skill;
