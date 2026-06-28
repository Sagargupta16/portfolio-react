import TechTag from "@components/ui/TechTag";
import { TEXT_SECONDARY } from "@/constants/theme";

interface BulletListProps {
   items: string[];
   gap?: number;
   extraStyle?: React.CSSProperties;
   accentColor: string;
   fontSize: number;
}

export const BulletList = ({
   items,
   gap = 8,
   extraStyle,
   accentColor,
   fontSize,
}: BulletListProps) => (
   <ul
      style={{
         display: "flex",
         flexDirection: "column",
         gap,
         ...extraStyle,
      }}
   >
      {items.map((desc, i) => (
         <li
            key={`${desc}-${i}`}
            style={{
               color: TEXT_SECONDARY,
               fontSize,
               lineHeight: 1.7,
               display: "flex",
               alignItems: "flex-start",
               gap: 8,
            }}
         >
            <span
               style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: `${accentColor}60`,
                  marginTop: 8,
                  flexShrink: 0,
               }}
            />
            {desc}
         </li>
      ))}
   </ul>
);

interface SkillTagsProps {
   skills: string[];
   accentColor: string;
   extraStyle?: React.CSSProperties;
}

export const SkillTags = ({
   skills,
   accentColor,
   extraStyle,
}: SkillTagsProps) => (
   <div style={{ display: "flex", flexWrap: "wrap", gap: 4, ...extraStyle }}>
      {skills.map((skill, i) => (
         <TechTag key={`${skill}-${i}`} label={skill} accent={accentColor} />
      ))}
   </div>
);
