import { Cloud, Code, Trophy, Brain, Palette, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
   "Full-Stack Development": Code,
   "DevOps & MLOps": Cloud,
   "Competitive Programming": Trophy,
   "Data Science & ML": Brain,
   "UI/UX Design": Palette,
   "Technical Consulting": Settings,
};

export interface AccentColor {
   iconBg: string;
   icon: string;
   dot: string;
   borderHover: string;
}

export const ACCENT_COLORS: AccentColor[] = [
   {
      iconBg: "rgba(6,182,212,0.1)",
      icon: "#06b6d4",
      dot: "#06b6d4",
      borderHover: "rgba(6,182,212,0.4)",
   },
   {
      iconBg: "rgba(168,85,247,0.1)",
      icon: "#a855f7",
      dot: "#a855f7",
      borderHover: "rgba(168,85,247,0.4)",
   },
   {
      iconBg: "rgba(34,197,94,0.1)",
      icon: "#22c55e",
      dot: "#22c55e",
      borderHover: "rgba(34,197,94,0.4)",
   },
   {
      iconBg: "rgba(245,158,11,0.1)",
      icon: "#f59e0b",
      dot: "#f59e0b",
      borderHover: "rgba(245,158,11,0.4)",
   },
   {
      iconBg: "rgba(236,72,153,0.1)",
      icon: "#ec4899",
      dot: "#ec4899",
      borderHover: "rgba(236,72,153,0.4)",
   },
   {
      iconBg: "rgba(99,102,241,0.1)",
      icon: "#6366f1",
      dot: "#6366f1",
      borderHover: "rgba(99,102,241,0.4)",
   },
];
