import SkillCategory, { type CategoryGlyph } from "./SkillCategory";

interface CategoryEntry {
   key: string;
   label: string;
   glyph: CategoryGlyph;
   items: string[];
}

interface SecondarySkillsProps {
   categories: CategoryEntry[];
   /** Rails above these rows, so their directions keep alternating. */
   railOffset: number;
}

// Secondary rows reveal and run as rails like the primary ones, with the
// small chips, but their glyphs hold still: the breathing primary glyphs are
// the section's whole glyph loop budget.
const SecondarySkills = ({ categories, railOffset }: SecondarySkillsProps) => {
   if (categories.length === 0) return null;

   return (
      <div
         style={{
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            gap: 48,
         }}
      >
         {categories.map(({ key, label, glyph, items }, index) => (
            <SkillCategory
               key={key}
               label={label}
               glyph={glyph}
               items={items}
               index={index}
               small
               rails={1}
               railOffset={railOffset + index}
            />
         ))}
      </div>
   );
};

export default SecondarySkills;
