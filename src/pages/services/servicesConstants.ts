import {
   Bot,
   Brain,
   Code,
   Handshake,
   Network,
   ShieldCheck,
   Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ServiceKey } from "@/types";
import { BLUE_LIGHT, BLUE_PALE, SKY } from "@/constants/theme";

/** Title icon per stable services.json `key`. */
export const SERVICE_ICONS: Record<ServiceKey, LucideIcon> = {
   "forward-deployed": Handshake,
   "landing-zones": ShieldCheck,
   "iac-cicd": Workflow,
   "cloud-networking": Network,
   "mlops-genai": Brain,
   "agent-tooling": Bot,
   "full-stack": Code,
};

interface AccentColor {
   iconBg: string;
   icon: string;
   dot: string;
}

/* One accent per card, blue family only. Three tones cycle so no two
   neighbours match, side by side or stacked: the full-width lead card above
   three rows of two on desktop, and the single phone column. */
const TONES = [BLUE_LIGHT, SKY, BLUE_PALE];

export const accentFor = (index: number): AccentColor => {
   const tone = TONES[index % TONES.length];
   return { iconBg: `${tone}1a`, icon: tone, dot: tone };
};

/* Every animation draws on an 80 px canvas. It scales 2.3x in the 200 px art
   column on desktop and 2x in the phone strip, which is sized to show the
   whole canvas. Labels do not grow with it: ServiceAnimation sets their size
   so they render at the project covers' 8 px on every screen. */
export const ART_CANVAS = 80;
export const ART_COLUMN = 200;
export const ART_SCALE_DESKTOP = 2.3;
export const ART_SCALE_COMPACT = 2;
export const ART_STRIP_HEIGHT = ART_CANVAS * ART_SCALE_COMPACT + 16;
export const ART_LABEL_PX = 8;

/* The lead card's canvas is twice as wide, so its scene reads left to right
   across the full-row card and fills the phone strip. */
export const ART_CANVAS_WIDE = 160;
const WIDE_ART: ReadonlySet<ServiceKey> = new Set(["forward-deployed"]);
export const isWideArt = (key: ServiceKey) => WIDE_ART.has(key);
export const ART_COLUMN_WIDE = ART_CANVAS_WIDE * ART_SCALE_DESKTOP + 32;
