import type { CSSProperties } from "react";
import { TEXT_SECONDARY } from "@/constants/theme";

// Shared measures of the timeline cards (EntryHeader, EntryDetails and the
// section contents that line up under them).

export const LOGO_TILE = 40;
export const LOGO_GAP = 10;

/** Desktop indent of everything under the name, so it starts under the name. */
export const ENTRY_INDENT = LOGO_TILE + LOGO_GAP;

/** Body text of a timeline card: the summary, a department, a bullet. */
export const ENTRY_TEXT: CSSProperties = {
   color: TEXT_SECONDARY,
   fontSize: 13,
   lineHeight: 1.7,
};
