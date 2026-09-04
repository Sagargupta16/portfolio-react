import { Mic2, FileText, GraduationCap } from "lucide-react";
import { CYAN, PURPLE, GREEN } from "@/constants/theme";

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
