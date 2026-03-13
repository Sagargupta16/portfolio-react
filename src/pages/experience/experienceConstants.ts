import { Mic2, FileText, GraduationCap } from "lucide-react";
import { CYAN, PURPLE, GREEN } from "@/constants/theme";

export const FADE_ENTRY = {
   initial: { opacity: 0, y: 10 },
   animate: { opacity: 1, y: 0 },
   exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const CONTRIB_ICON = {
   talk: Mic2,
   publication: FileText,
   program: GraduationCap,
} as const;

export const CONTRIB_TYPE_COLOR = {
   talk: CYAN,
   publication: PURPLE,
   program: GREEN,
} as const;
