import { Mic2, FileText, GraduationCap } from "lucide-react";
import { BLUE_LIGHT, SKY, GREEN } from "@/constants/theme";

export const CONTRIB_ICON = {
   talk: Mic2,
   publication: FileText,
   program: GraduationCap,
} as const;

export const CONTRIB_TYPE_COLOR = {
   talk: BLUE_LIGHT,
   publication: SKY,
   program: GREEN,
} as const;
