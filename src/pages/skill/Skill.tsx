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
import { getSkillCategoryLabel, getSkills } from "@data/skills";
import { getSectionCopy } from "@data/sections";
import type { SkillCategoryKey, SkillsData } from "@/types";
import { MAX_WIDTH } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import SkillCategory, { type CategoryGlyph } from "./SkillCategory";
import SecondarySkills from "./SecondarySkills";

interface CategoryConfig {
   glyph: CategoryGlyph;
   /** Rails the category spreads over in Full mode; AWS is long enough for two. */
   rails: number;
}

// Display order leads with the strongest positioning (DevOps/MLOps @ AWS),
// mirroring the hero badge -- not alphabetical, not stack-conventional. Every
// AWS service sits in the one AWS category. Labels live in skills.json
// `categories`, shared with the machine view.
const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
   aws: { glyph: Cloud, rails: 2 },
   devops: { glyph: Workflow, rails: 1 },
   ai_ml: { glyph: Brain, rails: 1 },
   ai_tools: { glyph: Bot, rails: 1 },
   languages: { glyph: Braces, rails: 1 },
   backend: { glyph: Database, rails: 1 },
   frontend: { glyph: PanelsTopLeft, rails: 1 },
   tools_platforms: { glyph: Wrench, rails: 1 },
};

// Only the glyph is configured; labels come from skills.json too.
const SECONDARY_GLYPHS: Record<string, CategoryGlyph> = {
   cs_fundamentals: BookOpen,
   soft_skills: HeartHandshake,
   areas_of_interest: Compass,
};

const Skill = () => {
   const skills: SkillsData = getSkills();
   const { title, subtitle } = getSectionCopy("skills");

   const primaryCategories = useMemo(() => {
      let railOffset = 0;
      return Object.entries(CATEGORY_CONFIG)
         .filter(([key]) => key in skills)
         .map(([key, { glyph, rails }]) => {
            const category = {
               key,
               label: getSkillCategoryLabel(key as SkillCategoryKey),
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
               label: getSkillCategoryLabel(key as SkillCategoryKey),
               glyph,
               items: skills[key as keyof SkillsData],
            })),
      [skills],
   );

   return (
      <PageSection id="skills" title={title} subtitle={subtitle}>
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

            <SecondarySkills
               categories={secondaryCategories}
               railOffset={primaryCategories.reduce(
                  (sum, { rails }) => sum + rails,
                  0,
               )}
            />
         </div>
      </PageSection>
   );
};

export default Skill;
