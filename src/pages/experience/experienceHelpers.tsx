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
      {items.map((desc) => (
         <li
            key={desc}
            style={{
               color: "#a5a5c0",
               fontSize,
               lineHeight: 1.7,
               display: "flex",
               alignItems: "flex-start",
               gap: 10,
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
   <div style={{ display: "flex", flexWrap: "wrap", gap: 6, ...extraStyle }}>
      {skills.map((skill) => (
         <span
            key={skill}
            style={{
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               fontSize: 11,
               padding: "3px 10px",
               borderRadius: 6,
               background: `${accentColor}10`,
               color: accentColor,
               border: `1px solid ${accentColor}20`,
            }}
         >
            {skill}
         </span>
      ))}
   </div>
);
