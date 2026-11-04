import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";
import { ENTRY_TEXT } from "./entryStyles";

interface EntryChipsProps {
   items: string[];
   accentColor: string;
   style?: CSSProperties;
}

/** Skill or coursework chips of a timeline card, one size in every list. */
export const EntryChips = ({
   items,
   accentColor,
   style,
}: Readonly<EntryChipsProps>) => (
   <div style={{ display: "flex", flexWrap: "wrap", gap: 4, ...style }}>
      {items.map((item) => (
         <span
            key={item}
            style={{
               fontFamily: MONO_FONT,
               fontSize: 11,
               padding: "3px 8px",
               borderRadius: 6,
               color: accentColor,
               // 8% fill, 15% edge as hex alpha suffixes.
               background: `${accentColor}14`,
               border: `1px solid ${accentColor}26`,
            }}
         >
            {item}
         </span>
      ))}
   </div>
);

interface EntryBulletsProps {
   items: string[];
   accentColor: string;
}

/** The bullet list inside a card's disclosure: responsibilities, achievements. */
export const EntryBullets = ({
   items,
   accentColor,
}: Readonly<EntryBulletsProps>) => (
   <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
         <li
            key={item}
            style={{
               ...ENTRY_TEXT,
               display: "flex",
               alignItems: "flex-start",
               gap: 8,
            }}
         >
            <span
               aria-hidden="true"
               style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  // 50% alpha as a hex suffix.
                  background: `${accentColor}80`,
                  marginTop: 9,
                  flexShrink: 0,
               }}
            />
            {item}
         </li>
      ))}
   </ul>
);
