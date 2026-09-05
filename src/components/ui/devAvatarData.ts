import type { SkillIcon } from "@pages/skill/skillIcons";
import { getSkillIcon } from "@pages/skill/skillIcons";
import { TEXT_PRIMARY } from "@/constants/theme";

// Geometry of the 320 px frame. About.tsx scales the whole avatar 0.8 on
// phones, so nothing in here is responsive.
export const AVATAR_SIZE = 320;
export const DISC_DIAMETER = 168;
export const ORBIT_RADIUS = 124;
export const TILE_SIZE = 40;
export const TILE_RADIUS = 12;
export const GLYPH_SIZE = 18;
export const MONOGRAM_SIZE = 64;

/** One clockwise revolution of the stack ring, in seconds. */
export const ORBIT_PERIOD = 40;

// Flat-card surface shared by the disc and the tiles (mirrors .glass-card).
export const CARD_FILL = "var(--color-bg-card)";
export const HAIRLINE = "rgba(255, 255, 255, 0.06)";
/** Body-text token at 72% alpha (0xb8) so the glyph tint follows the theme. */
export const GLYPH_COLOR = `${TEXT_PRIMARY}b8`;

/**
 * The eight tools he actually ships with, clockwise from 12 o'clock. Names
 * are Skills-registry keys so each glyph is the same brand mark the Skills
 * section renders; the registry colour is discarded (one blue family only).
 */
const ORBIT_SKILLS = [
   "AWS",
   "Terraform",
   "GitHub Actions",
   "Docker",
   "Python",
   "Bash",
   "TypeScript",
   "Claude Code",
] as const;

export interface OrbitItem {
   name: string;
   Icon: SkillIcon["Icon"];
   /** Degrees clockwise from 12 o'clock. */
   angle: number;
}

const ORBIT_STEP = 360 / ORBIT_SKILLS.length;

export const orbitItems: OrbitItem[] = ORBIT_SKILLS.flatMap((name, index) => {
   const skill = getSkillIcon(name);
   if (!skill) return [];
   return [{ name, Icon: skill.Icon, angle: index * ORBIT_STEP }];
});

/**
 * Centre of a tile on the orbit track, in frame px (y grows downward).
 * Rounded so the diagonal tiles keep crisp 1 px borders in Reduced mode.
 */
export const orbitPosition = (angle: number) => {
   const rad = (angle * Math.PI) / 180;
   const centre = AVATAR_SIZE / 2;
   return {
      x: Math.round(centre + ORBIT_RADIUS * Math.sin(rad)),
      y: Math.round(centre - ORBIT_RADIUS * Math.cos(rad)),
   };
};
