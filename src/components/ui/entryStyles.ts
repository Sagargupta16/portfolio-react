import type { CSSProperties } from "react";
import { TEXT_SECONDARY } from "@/constants/theme";

// Shared measures of the timeline cards (TimelineEntry, EntryHeader,
// EntryDetails and the section contents that line up under them). The card
// follows the project and service cards: 24px body (20px on phones), 20px
// titles, 14px summaries, neutral mono chips, art edge to edge in its own
// tinted column.

/** The logo tile, sized like the floating stack tiles (StackTile "wide"). */
export const LOGO_TILE = 44;
export const LOGO_GAP = 14;

/** Desktop indent of everything under the name, so it starts under the name. */
export const ENTRY_INDENT = LOGO_TILE + LOGO_GAP;

/** Width of the art or list column on the right of a desktop card: 340px on
 * the full 1152px column, never under 260px so a 1024px screen keeps the text
 * readable beside it. */
export const ENTRY_SIDE_WIDTH = "clamp(260px, 36%, 340px)";

/** Body text of a timeline card: the summary, a department. */
export const ENTRY_TEXT: CSSProperties = {
   color: TEXT_SECONDARY,
   fontSize: 14,
   lineHeight: 1.7,
};
