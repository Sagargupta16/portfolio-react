import { Bot, Brain, Code, Network, ShieldCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
   "Landing Zones & Cloud Governance": ShieldCheck,
   "Infrastructure as Code & CI/CD": Workflow,
   "Cloud Networking": Network,
   "MLOps & GenAI on AWS": Brain,
   "AI Agents & Developer Tooling": Bot,
   "Full-Stack Product Builds": Code,
};

export interface AccentColor {
   iconBg: string;
   icon: string;
   dot: string;
}

/* One accent per card, blue family only. Three tones cycle so no two
   neighbours match, side by side or stacked, in the two-column desktop grid
   and in the single phone column. */
const TONES = ["#60a5fa", "#38bdf8", "#93c5fd"];

export const ACCENT_COLORS: AccentColor[] = Array.from(
   { length: 6 },
   (_, i) => {
      const tone = TONES[i % TONES.length];
      return { iconBg: `${tone}1a`, icon: tone, dot: tone };
   },
);

/* Every animation draws on an 80 px canvas. It scales 1.8x beside the copy on
   desktop and 1.5x in the phone strip, which is sized to show the whole
   canvas, so the 6 px source labels render at 9 px or larger everywhere. */
export const ART_CANVAS = 80;
export const ART_SCALE_DESKTOP = 1.8;
export const ART_SCALE_COMPACT = 1.5;
export const ART_STRIP_HEIGHT = ART_CANVAS * ART_SCALE_COMPACT + 8;
