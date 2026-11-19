/* The cast's art: the manifest (frame size, poses and ground rows per
   member) and the strip files, both resolved by the bundler. Nothing here
   fetches: the manifest is a static import and a strip URL is a hashed asset
   URL, so a replaced strip gets a new URL by itself. */

import rawManifest from "./manifest.json";

export const POSES = [
   "idle",
   "wink",
   "crouch",
   "jump",
   "land",
   "wave",
   "sit",
   "sleep",
] as const;
export type Pose = (typeof POSES)[number];

export const MEMBER_IDS = [
   "sagar",
   "denim",
   "teal",
   "mustard",
   "bob",
   "backpack",
   "grey",
   "rose",
   "blazer",
   "visitor",
] as const;
export type CastMemberId = (typeof MEMBER_IDS)[number];

/** Where a frame meets the surface, as fractions of frame height from the
    top: `ground` is the registered ground row, `bottom` the lowest drawn
    row (the jump frame floats, so its bottom is above its ground). */
export interface FrameRows {
   ground: number;
   bottom: number;
   /** The drawn figure's box in px of the full-size frame: left, top,
       right, bottom. */
   bbox: readonly [number, number, number, number];
}

export interface CastMember {
   id: CastMemberId;
   /** The poses in strip order, left to right. */
   order: readonly Pose[];
   /** Frame heights in px that a strip exists for, ascending. */
   sizes: readonly number[];
   frames: Partial<Record<Pose, FrameRows>>;
}

export interface CastManifest {
   /** One frame's width and height in px at full size. */
   size: readonly [number, number];
   /** The ground row per pose for a member that has no row of its own. */
   ground: Partial<Record<Pose, number>>;
   members: readonly CastMember[];
}

const isPose = (s: string): s is Pose =>
   (POSES as readonly string[]).includes(s);
const isMemberId = (s: string): s is CastMemberId =>
   (MEMBER_IDS as readonly string[]).includes(s);

// Narrows the JSON once at load, so a typo in the art fails loudly here
// instead of showing the wrong frame.
function readManifest(raw: typeof rawManifest): CastManifest {
   const pose = (s: string): Pose => {
      if (!isPose(s)) throw new Error(`cast: unknown pose "${s}"`);
      return s;
   };
   const ground: Partial<Record<Pose, number>> = {};
   for (const [k, v] of Object.entries(raw.ground)) ground[pose(k)] = v;
   const [w, h] = raw.size;
   return {
      size: [w, h],
      ground,
      members: raw.members.map((m) => {
         if (!isMemberId(m.id))
            throw new Error(`cast: unknown member "${m.id}"`);
         const frames: Partial<Record<Pose, FrameRows>> = {};
         for (const [k, v] of Object.entries(m.frames)) {
            const [left, top, right, bottom] = v.bbox;
            frames[pose(k)] = {
               ground: v.ground,
               bottom: v.bottom,
               bbox: [left, top, right, bottom],
            };
         }
         return {
            id: m.id,
            order: m.order.map(pose),
            sizes: [...m.sizes].sort((a, b) => a - b),
            frames,
         };
      }),
   };
}

export const MANIFEST: CastManifest = readManifest(rawManifest);

// "<member>/<frame height>" -> the bundled strip URL.
const STRIPS = new Map<string, string>();
for (const [path, url] of Object.entries(
   import.meta.glob<string>("@assets/footer/cast/*/strip-*.avif", {
      eager: true,
      query: "?url",
      import: "default",
   }),
)) {
   const m = /\/([^/]+)\/strip-(\d+)\.avif$/.exec(path);
   if (m) STRIPS.set(`${m[1]}/${m[2]}`, url);
}

/** The strip for a member drawn `px` CSS px tall: the smallest listed size
    that is at least px x min(devicePixelRatio, 2) x 0.85 (a 15 percent
    upscale of line art does not show, and it keeps a phone on the small
    strips), else the largest. */
export function stripFor(member: CastMember, px: number): string {
   const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
   const need = px * dpr * 0.85;
   const listed = member.sizes.filter((s) => STRIPS.has(`${member.id}/${s}`));
   const size = listed.find((s) => s >= need) ?? listed.at(-1);
   const url =
      size === undefined ? undefined : STRIPS.get(`${member.id}/${size}`);
   if (url === undefined) throw new Error(`cast: no strip for "${member.id}"`);
   return url;
}

/** The frame row that touches the surface, as a fraction of frame height:
    the feet when standing, the ledge row when seated. A frame drawn above
    its registered ground row (jump) is anchored by its own feet. */
export function groundRow(member: CastMember, pose: Pose): number {
   const f = member.frames[pose];
   const g = f?.ground ?? MANIFEST.ground[pose] ?? 0.995;
   return f?.bottom === undefined ? g : Math.min(g, f.bottom);
}

export function memberById(id: CastMemberId): CastMember {
   const member = MANIFEST.members.find((m) => m.id === id);
   if (!member) throw new Error(`cast: no member "${id}" in the manifest`);
   return member;
}

/** One member's frames at a size, for a scene that shows them without a
    stage. */
export interface MemberFrames {
   /** The strip to use at this size (see stripFor). */
   src: string;
   /** One frame's width and height in CSS px (the strip is width x
       order.length wide). */
   width: number;
   height: number;
   /** The poses in strip order: frame i starts at x = -i x width. */
   order: readonly Pose[];
   /** Per pose, the row that touches the surface, as a fraction of height
       from the frame's top (the same row an actor stands on). */
   ground: Partial<Record<Pose, number>>;
}

export function memberFrames(id: CastMemberId, height: number): MemberFrames {
   const member = memberById(id);
   const h = Math.round(height);
   const ground: Partial<Record<Pose, number>> = {};
   for (const p of member.order) ground[p] = groundRow(member, p);
   return {
      src: stripFor(member, h),
      width: Math.round((h * MANIFEST.size[0]) / MANIFEST.size[1]),
      height: h,
      order: member.order,
      ground,
   };
}
