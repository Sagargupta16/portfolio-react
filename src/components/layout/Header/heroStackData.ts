import type { SkillIcon } from "@pages/skill/skillIcons";
import { getSkillIcon } from "@pages/skill/skillIcons";
import { getHeroStack } from "@data/skills";

/**
 * Geometry and timing of the floating stack field behind the hero. Slots are
 * percentages of the hero section, so nothing re-measures on resize and the
 * drift loops never restart. The table is deterministic: a tile can never
 * land on the copy column (x 298-1136 at 1440; on phones the corner lanes
 * sit level with the logo and beside the scroll hint, clear of every line).
 */

export interface HeroStackSlot {
   /** Tile centre, percent of the hero width. */
   x: number;
   /** Tile centre, percent of the hero height. */
   y: number;
   /** Pointer parallax travel at the viewport edge, px; larger reads nearer. */
   depth: number;
   /** One drift cycle, seconds; neighbours never share one. */
   period: number;
   /** Mid-flank slots need the >= 1280px flanks; corner lanes exist everywhere. */
   wide?: boolean;
}

/**
 * Corner lanes first (top lane level with the logo, above the badge, which
 * is 268px wide on a phone; bottom lane beside the socials and scroll hint,
 * clear of the fixed motion control at bottom-left), then the
 * four mid-flank slots that only mount on wide viewports. Item i of the
 * ranked hero_stack takes slot i, so the six corner tiles show the same
 * names at every width. Drift only moves a tile up and right, so the
 * clearance below each slot never shrinks.
 */
export const HERO_STACK_SLOTS: readonly HeroStackSlot[] = [
   { x: 8, y: 12, depth: 6, period: 11 },
   { x: 92, y: 12, depth: 5, period: 12 },
   { x: 15, y: 15, depth: 9, period: 13 },
   { x: 86, y: 15, depth: 8, period: 10 },
   { x: 14, y: 86, depth: 7, period: 14 },
   { x: 90, y: 92, depth: 10, period: 9 },
   { x: 6, y: 44, depth: 10, period: 12.5, wide: true },
   { x: 94, y: 40, depth: 8, period: 13.5, wide: true },
   { x: 12, y: 61, depth: 4, period: 9.5, wide: true },
   { x: 88, y: 57, depth: 5, period: 10.5, wide: true },
];

export interface TileSize {
   tile: number;
   glyph: number;
   radius: number;
}

/** DevAvatar's 40px tile where the flanks allow it, a 28px cut elsewhere. */
export const TILE_SIZES: Record<"wide" | "compact", TileSize> = {
   wide: { tile: 40, glyph: 18, radius: 12 },
   compact: { tile: 28, glyph: 13, radius: 8 },
};

/** Whole-tile alpha: dimmer than body copy so the field stays behind it. */
export const TILE_OPACITY = 0.55;

/** Tiles fade in once the copy's own stagger has finished (about 1.05s). */
export const ENTER_DELAY = 1;
export const ENTER_DURATION = 0.6;
export const ENTER_RISE = 8;

/** Drift loop: one slow figure that ends on its first frame. */
export const DRIFT = {
   y: [0, -12, 0],
   x: [0, 5, 0],
   rotate: [0, 2, 0],
};
export const DRIFT_TIMES = [0, 0.5, 1];
/** Per-tile phase offset so the field never breathes in unison. */
export const DRIFT_STAGGER = 0.7;

export interface HeroStackItem {
   name: string;
   Icon: SkillIcon["Icon"];
}

/*
 * Ranked hero_stack names resolved to glyphs. Misses drop out and repeated
 * glyphs collapse (every grouped AWS string shares one mark), so the two
 * spare names in data cover both cases. The registry colour is discarded:
 * one blue family only, as in DevAvatar.
 */
const resolved: HeroStackItem[] = [];
const seenGlyphs = new Set<HeroStackItem["Icon"]>();
for (const name of getHeroStack()) {
   const skill = getSkillIcon(name);
   if (!skill || seenGlyphs.has(skill.Icon)) continue;
   seenGlyphs.add(skill.Icon);
   resolved.push({ name, Icon: skill.Icon });
}
export const heroStackItems: readonly HeroStackItem[] = resolved;
