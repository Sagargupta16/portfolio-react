import type { SkillIcon } from "@utils/skillIcons";
import { getSkillIcon } from "@utils/skillIcons";
import { getHeroStack } from "@data/skills";

/**
 * Geometry and timing of the floating stack field. Two layers share it:
 * HeroStackField (phones and tablets: six corner tiles inside the hero) and
 * StackFieldBackdrop (>= 1280px: twelve tiles in the viewport flanks on a
 * fixed layer, recycling through the page as it scrolls). Every table is
 * deterministic, so nothing re-measures on resize and the drift loops never
 * restart. Item i of the ranked hero_stack takes slot i in either table.
 */

/** Corner lane inside the hero; percentages of the hero section. */
export interface HeroStackSlot {
   /** Tile centre, percent of the hero width. */
   x: number;
   /** Tile centre, percent of the hero height. */
   y: number;
   /** Pointer parallax travel at the viewport edge, px; larger reads nearer. */
   depth: number;
   /** One drift cycle, seconds; neighbours never share one. */
   period: number;
   /** Scroll parallax: fraction of the scroll distance the tile slides outward. */
   speed: number;
}

/**
 * Top lane level with the logo, above the badge (268px wide on a phone);
 * bottom lane beside the socials and scroll hint, clear of the fixed motion
 * control at bottom-left. Scrolling slides each tile towards its own edge
 * and drift only moves a tile up and right, so the clearance to the copy
 * never shrinks.
 */
export const HERO_STACK_SLOTS: readonly HeroStackSlot[] = [
   { x: 8, y: 12, depth: 6, period: 11, speed: 0.22 },
   { x: 92, y: 12, depth: 5, period: 12, speed: 0.18 },
   { x: 17, y: 17, depth: 9, period: 13, speed: 0.3 },
   { x: 83, y: 17, depth: 8, period: 10, speed: 0.26 },
   { x: 14, y: 86, depth: 7, period: 14, speed: 0.24 },
   { x: 90, y: 92, depth: 10, period: 9, speed: 0.32 },
];

/** -1 for the left lane, 1 for the right: the way a tile slides on scroll. */
export const laneSign = (slot: HeroStackSlot) => (slot.x < 50 ? -1 : 1);

export const isTopLane = (slot: HeroStackSlot) => slot.y < 50;

/**
 * Top-lane tiles fade out over this much scroll: the nearest sits 34px under
 * the 64px fixed nav on a phone, so it is gone before it slides beneath the
 * bar. The bottom lane has the whole hero to leave sideways.
 */
export const TOP_LANE_FADE = 32;

/** Flank slot for the fixed site-wide layer (>= 1280px). */
export interface FlankSlot {
   side: "left" | "right";
   /** Gap between the viewport edge and the tile, px. */
   edge: number;
   /** Rest position along the band at scroll 0: 0 is the top, 1 the bottom. */
   rest: number;
   /** Scroll parallax: fraction of the scroll distance the tile travels. */
   speed: number;
   /** Pointer parallax travel at the viewport edge, px; larger reads nearer. */
   depth: number;
   /** One drift cycle, seconds. */
   period: number;
}

/**
 * The vertical band tiles recycle through, px from the viewport edges: under
 * the 64px nav, above the fixed motion control and BackToTop (32px inset,
 * 44px tall). Tiles fade over the last `fade` px at both ends so the jump
 * from one end to the other is never seen.
 */
export const FLANK_BAND = { top: 80, bottom: 96, fade: 80 } as const;

/**
 * Scroll progress where the field starts fading out and how far the fade
 * runs. The footer columns sit on a 1280px grid whose text reaches the
 * flanks below 1370px, so the tiles are gone before the footer arrives.
 */
export const END_FADE = { start: 0.95, span: 0.04 } as const;

/**
 * Twelve flank slots alternating sides. `edge + depth` stays <= 32, so a
 * tile's furthest reach (edge + 44 tile + 5 drift + depth) is 81px, inside
 * the 85px the 1152px section column leaves free at 1280px. Speeds differ
 * so the flanks read as layers at several depths.
 */
export const FLANK_SLOTS: readonly FlankSlot[] = [
   { side: "left", edge: 16, rest: 0.14, speed: 0.46, depth: 9, period: 11 },
   { side: "right", edge: 20, rest: 0.2, speed: 0.24, depth: 5, period: 12 },
   { side: "left", edge: 24, rest: 0.28, speed: 0.3, depth: 6, period: 13 },
   { side: "right", edge: 14, rest: 0.34, speed: 0.5, depth: 10, period: 10 },
   { side: "left", edge: 14, rest: 0.42, speed: 0.2, depth: 4, period: 14 },
   { side: "right", edge: 24, rest: 0.48, speed: 0.36, depth: 7, period: 9 },
   { side: "left", edge: 20, rest: 0.56, speed: 0.4, depth: 8, period: 12.5 },
   { side: "right", edge: 16, rest: 0.62, speed: 0.22, depth: 5, period: 13.5 },
   { side: "left", edge: 12, rest: 0.7, speed: 0.34, depth: 7, period: 9.5 },
   { side: "right", edge: 22, rest: 0.76, speed: 0.44, depth: 9, period: 10.5 },
   { side: "left", edge: 22, rest: 0.84, speed: 0.26, depth: 5, period: 11.5 },
   { side: "right", edge: 12, rest: 0.87, speed: 0.32, depth: 6, period: 12.8 },
];

export interface TileSize {
   tile: number;
   glyph: number;
   radius: number;
}

/** 44px tiles in the flanks, a 32px cut in the hero corners. */
export const TILE_SIZES: Record<"wide" | "compact", TileSize> = {
   wide: { tile: 44, glyph: 20, radius: 12 },
   compact: { tile: 32, glyph: 15, radius: 9 },
};

/** Whole-tile alpha: legible, still a step behind the copy. */
export const TILE_OPACITY = 0.85;

/** Tiles fade in once the copy's own stagger has finished (about 1.05s). */
export const ENTER_DELAY = 1;
export const ENTER_DURATION = 0.6;
export const ENTER_RISE = 8;
export const STAGGER_STEP = 0.05;
export const STAGGER_CAP = 0.3;

/** Drift loop: one slow figure that ends on its first frame. */
export const DRIFT = {
   y: [0, -12, 0],
   x: [0, 5, 0],
   rotate: [0, 2, 0],
};
export const DRIFT_TIMES = [0, 0.5, 1];
/* One ease per keyframe segment so every track shares one schedule (the
   cover scenes' perSegment helpers do the same). */
export const DRIFT_EASE = DRIFT_TIMES.slice(1).map(() => "easeInOut" as const);
/** Per-tile phase offset so the field never breathes in unison. */
export const DRIFT_STAGGER = 0.7;

export interface HeroStackItem {
   name: string;
   Icon: SkillIcon["Icon"];
   /** The registry's brand colour, as the Skills section paints the glyph. */
   color: string;
}

/*
 * Ranked hero_stack names resolved to glyphs. Misses drop out and repeated
 * glyphs collapse (every grouped AWS string shares one mark), so the two
 * spare names in data cover both cases.
 */
const resolved: HeroStackItem[] = [];
const seenGlyphs = new Set<HeroStackItem["Icon"]>();
for (const name of getHeroStack()) {
   const skill = getSkillIcon(name);
   if (!skill || seenGlyphs.has(skill.Icon)) continue;
   seenGlyphs.add(skill.Icon);
   resolved.push({ name, Icon: skill.Icon, color: skill.color });
}
export const heroStackItems: readonly HeroStackItem[] = resolved;

export interface Placement<S> {
   item: HeroStackItem;
   slot: S;
}

/** Slot i takes item i; slots past the last resolved item stay empty. */
export const placeItems = <S>(slots: readonly S[]): Placement<S>[] =>
   slots.flatMap((slot, index) => {
      const item = heroStackItems.at(index);
      return item ? [{ item, slot }] : [];
   });
