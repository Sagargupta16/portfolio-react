import {
   Cloud,
   Code,
   Trophy,
   Brain,
   Bot,
   Shield,
   Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
   "Full-Stack Development": Code,
   "Cloud & DevOps": Cloud,
   "AI/ML & MLOps": Brain,
   "AI Agents & Tooling": Bot,
   "AI-Driven Development (AI-DLC)": Sparkles,
   "Cloud Consulting": Shield,
   "Competitive Programming": Trophy,
};

export interface AccentColor {
   iconBg: string;
   icon: string;
   dot: string;
   borderHover: string;
}

export const ACCENT_COLORS: AccentColor[] = [
   {
      iconBg: "rgba(96,165,250,0.1)",
      icon: "#60a5fa",
      dot: "#60a5fa",
      borderHover: "rgba(96,165,250,0.4)",
   },
   {
      iconBg: "rgba(56,189,248,0.1)",
      icon: "#38bdf8",
      dot: "#38bdf8",
      borderHover: "rgba(56,189,248,0.4)",
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
      iconBg: "rgba(96,165,250,0.1)",
      icon: "#60a5fa",
      dot: "#60a5fa",
      borderHover: "rgba(96,165,250,0.4)",
   },
   {
      iconBg: "rgba(56,189,248,0.1)",
      icon: "#38bdf8",
      dot: "#38bdf8",
      borderHover: "rgba(56,189,248,0.4)",
   },
];
