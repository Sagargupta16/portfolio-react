import type { CSSProperties } from "react";
import {
   AMBER,
   BLUE,
   CYAN,
   MONO_FONT,
   PURPLE,
   TEXT_SECONDARY,
} from "@/constants/theme";

/** One slice of a SplitBar: `weight` sizes it, `display` is the legend value. */
export interface SplitSegment {
   key: string;
   label: string;
   weight: number;
   display: string;
   color: string;
}

/** Small uppercase mono caption shared by the platform cards. */
export const CAPTION_STYLE: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 10,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   color: TEXT_SECONDARY,
};

// Top languages take the blue family in order rather than GitHub's language
// colours: one accent family on the page. Neighbours alternate light and deep
// so adjacent slices stay distinct.
export const LANGUAGE_SHADES = [
   BLUE,
   CYAN,
   "#1e40af",
   PURPLE,
   "#93c5fd",
   "#bfdbfe",
];

// LeetCode is the one amber surface; difficulty reads as amber strength,
// hard at full strength.
export const DIFFICULTY_SHADES = {
   easy: `${AMBER}59`,
   medium: `${AMBER}a6`,
   hard: AMBER,
};
