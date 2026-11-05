import type { CSSProperties } from "react";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";

interface EntryChipsProps {
   items: string[];
   style?: CSSProperties;
}

/** Skill or coursework chips: the project cards' neutral mono chip. */
export const EntryChips = ({ items, style }: Readonly<EntryChipsProps>) => (
   <div className="entry-chips" style={style}>
      {items.map((item) => (
         <span key={item}>{item}</span>
      ))}
   </div>
);

interface EntryChipListProps {
   /** Caption above the chips ("Skills", "Coursework"). */
   label: string;
   items: string[];
   /** The right column of a desktop card: padded like the card body. */
   padded: boolean;
}

/** A captioned chip list: the right column of a card that has no art. */
export const EntryChipList = ({
   label,
   items,
   padded,
}: Readonly<EntryChipListProps>) => (
   <div style={padded ? { padding: 24 } : undefined}>
      <p
         style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            color: TEXT_MUTED,
            marginBottom: 10,
         }}
      >
         {label}
      </p>
      <EntryChips items={items} />
   </div>
);

interface EntryBulletsProps {
   items: string[];
   accentColor: string;
}

/** The bullets inside a card's disclosure, as the service cards list theirs. */
export const EntryBullets = ({
   items,
   accentColor,
}: Readonly<EntryBulletsProps>) => (
   <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
         <li
            key={item}
            style={{
               display: "flex",
               alignItems: "flex-start",
               gap: 8,
               color: TEXT_SECONDARY,
               fontSize: 13,
               lineHeight: 1.6,
            }}
         >
            <span
               aria-hidden="true"
               style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  marginTop: 8,
                  flexShrink: 0,
                  backgroundColor: accentColor,
               }}
            />
            {item}
         </li>
      ))}
   </ul>
);
