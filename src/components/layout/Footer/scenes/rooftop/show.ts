/* The cast and the show of the rooftop scene, ported from the footer lab's
   draft "Rooftop, after hours" (rooftop.js and controls.js). The numbers are
   the draft's: they are the look he approved, so change one only on purpose
   and check it on screen.

   Entrance (once, when the footer comes into view, about 4 s): he sits on the
   parapet at the centre, hops down and waves. His friends hop in from both
   edges, landings alternating sides: first the ones who stand, outside in,
   so the landings run toward him (each one further in passes behind the one
   already down); then the ones who sit, along the foot of the wall behind
   everyone and up into their seats, inside out, so nobody ever passes a
   friend sitting on the wall. Every hop count is chosen so no touchdown on
   the way falls on a friend already standing there. The visitor in blue hops
   in last from the left; the greeting runs outward from him and the visitor
   waves back.
   Loop: a beat every 7 to 10 s, quiet in between: small ones in turn (a sitter
   and a friend below trade a greeting, two friends swap places, he winks, a
   friend and a sitter trade places) and the cheer as every third beat,
   starting with the second. Left alone for 25 s the night winds down and the
   visitor, the only one still up, waves him good night; any input wakes it,
   him first.
   The twist: the email control walks the visitor over to him. */

import type {
   Actor,
   CastMemberId,
   HopOptions,
   Pose,
   Show,
   Stage,
} from "../cast";
import type { FooterSceneEmailEvents } from "../types";
import { BAND_BOTTOM, type Fit, WALL_FOOT, WALL_TOP } from "./geometry";

const noop = (): void => {};
const clamp = (v: number, lo: number, hi: number): number =>
   Math.min(hi, Math.max(lo, v));

/* Spots as fractions: x of the half-width (see span); y of the painting's
   height above the wall foot (negative: in front of it, nearer the viewer,
   so lower on screen) or "wall" for a seat on the parapet. A stander's last
   number is where it sits down when the night winds down. */
type Seat = number | "wall";
type Member = readonly [
   id: CastMemberId,
   x: number,
   y: Seat,
   scale: number,
   night?: number,
];
type SmallBeat = "trade" | "swap" | "wink" | "seatSwap";
interface Layout {
   /** His frame height, as a fraction of the painting's height. */
   unit: number;
   him: readonly [number, number];
   you: {
      home: readonly [number, number];
      mid?: readonly [number, number];
      to: readonly [number, number];
      scale: number;
   };
   cast: readonly Member[];
   smalls: readonly SmallBeat[];
}

// The visitor's home stays inside the opaque part of the scene at every
// width (the side fade over 1344 px is 0.12 of the painting's height).
const WIDE: Layout = {
   unit: 0.45,
   him: [0, -0.115],
   you: { home: [-0.84, -0.1], to: [-0.135, -0.105], scale: 0.82 },
   cast: [
      ["denim", -0.72, "wall", 0.8],
      // out at -0.6, so the hold's mid-trip touchdown falls in the gap
      ["teal", -0.6, -0.085, 0.82, -0.585],
      ["mustard", -0.37, "wall", 0.8],
      ["bob", -0.26, -0.055, 0.8, -0.19],
      ["backpack", 0.2, -0.06, 0.82, 0.19],
      ["grey", 0.37, "wall", 0.8],
      ["rose", 0.55, -0.09, 0.82, 0.57],
      ["blazer", 0.78, "wall", 0.8],
   ],
   smalls: ["trade", "swap", "wink", "seatSwap"],
};
// Phones follow the phone mock: the visitor in front at the far left, a
// friend sitting above and to its right, another a step back beside him.
// The slide's half-way stop is its own spot in the front row.
const NARROW: Layout = {
   unit: 0.46,
   him: [0, -0.11],
   you: {
      home: [-0.82, -0.135],
      mid: [-0.57, -0.15],
      to: [-0.3, -0.145],
      scale: 0.8,
   },
   cast: [
      ["teal", -0.68, "wall", 0.78],
      ["denim", -0.38, 0, 0.78, -0.38],
      ["rose", 0.42, -0.06, 0.8, 0.4],
      ["grey", 0.66, "wall", 0.78],
   ],
   smalls: ["trade", "seatSwap", "wink"],
};
// On a tablet the painting is taller than the draft's at that width (the
// stage box is 360 px), so the people are capped by the stage's width: the
// draft's own crowding at 768 px, frame height 0.47 of the half-width.
const WIDE_UNIT_CAP = 0.47;

/* ---------- the way in (timings of the engine's hop clock) ---------- */
const SPEED = 0.55; // ground speed, px per ms, the same for all
const G_STAND = 300; // ms between two landings of the standers (alternating sides)
const G_SIT = 180; // the same for the sitters
const G_YOU = 260; // the visitor after the last sitter
const LEAD = 1000; // his take-off to the first landing
const SETTLED = 200; // a floor landing's low frame is over by then
// CAST.md: crouch 90, contact 80; air is passed in, so these are the trip.
const CROUCH = 90;
const CONTACT = 80;
const airOf = (step: number): number =>
   Math.round(Math.max(260, step / SPEED - CONTACT));

/* ---------- the twist ---------- */
const AIR = 240; // ms per hop: crouch 90 + 240 + contact 80 + 240 = the 650 ms hold
const LIGHT = 180; // a light landing after the touchdown (a hop under 0.3 h)
const HOME_MS = 2800; // beside him after a copy, then back to its mark
const QUIET_MS = 25000; // left alone this long, the night winds down

interface Spot {
   x: number;
   y: number;
   seat: boolean;
   z: number;
   night: number | null;
}
interface Route {
   x: number;
   hops: number;
   step: number;
   air: number;
}
interface Trip extends Route {
   a: Actor;
   to: Spot;
   y: number;
   z: number;
   touch: number;
   slot: number;
}

/** The scene's input clock: when the visitor last did anything. */
export interface InputClock {
   last: number;
}

/** A one-shot timeout that holds its remaining time while the scene is held
    (the engine's own clock is for the show and rejects when it stops). */
class HeldTimer {
   private id = 0;
   private left = 0;
   private at = 0;
   private held = false;
   private fn: (() => void) | null = null;
   start(ms: number, fn: () => void): void {
      this.cancel();
      this.fn = fn;
      this.left = ms;
      if (!this.held) this.arm();
   }
   hold(on: boolean): void {
      if (on === this.held) return;
      this.held = on;
      if (!this.fn) return;
      if (on) {
         clearTimeout(this.id);
         this.left = Math.max(0, this.left - (performance.now() - this.at));
      } else this.arm();
   }
   cancel(): void {
      clearTimeout(this.id);
      this.fn = null;
   }
   private arm(): void {
      this.at = performance.now();
      this.id = window.setTimeout(() => {
         const fn = this.fn;
         this.fn = null;
         fn?.();
      }, this.left);
   }
}

export interface RooftopShow {
   /** One pass of the show, for stage.play. */
   run: Show;
   /** Reduced: everyone on their marks, four sitting, him waving. */
   still(): void;
   /** Back from the still: the loop picks up from the marks. */
   fromStill(): void;
   /** Holds the scene's own timer while the stage is held. */
   hold(on: boolean): void;
   /** Done with this layout (the stage itself is the caller's). */
   dispose(): void;
   email: Required<FooterSceneEmailEvents>;
}

/** Builds the cast for this stage box on `stage` (clearing whatever was
    there) and returns its show. Call it from a ResizeObserver callback. */
export function buildShow(
   stage: Stage,
   fit: Fit,
   clock: InputClock,
): RooftopShow {
   stage.clear();
   const L = fit.wide ? WIDE : NARROW;
   const ih = fit.ih;
   const half = Math.floor(fit.width / 2); // the cast element is 2 x half wide
   // x is a fraction of the stage's half-width, or of the painting's where
   // the screen is wider than the painting.
   const span = Math.min(half, fit.artWidth / 2);
   const wallY = Math.round((WALL_FOOT - WALL_TOP) * ih); // the parapet's top, px above the floor line
   const unit = L.unit * ih;
   stage.unit = Math.round(
      fit.wide ? Math.min(unit, WIDE_UNIT_CAP * span) : unit,
   );
   stage.floor = Math.round((BAND_BOTTOM - WALL_FOOT) * ih);
   const frameWidth = stage.troupe.size[0];

   const marks = new Map<Actor, Spot>(); // where each one belongs now
   const homes = new Map<Actor, Spot>(); // its first spot (the Reduced still)
   const mark = (a: Actor): Spot =>
      marks.get(a) ?? { x: a.x, y: a.y, seat: false, z: a.z, night: null };

   // A spot in px. z orders by depth: seats behind everyone on the floor.
   const spot = (fx: number, fy: Seat, night?: number): Spot => {
      const seat = fy === "wall";
      return {
         x: Math.round(fx * span),
         y: seat ? wallY : Math.round(fy * ih),
         seat,
         z: seat ? 12 : 24 + Math.round(-fy * 100),
         night: night === undefined ? null : Math.round(night * span),
      };
   };
   // Keeps a figure's drawn box inside the stage (a 320 px phone).
   const inside = (a: Actor, x: number, pose: Pose): number => {
      const box = a.member.frames[pose]?.bbox;
      if (!box) return x;
      let l = (box[0] / frameWidth - 0.5) * a.w;
      let r = (box[2] / frameWidth - 0.5) * a.w;
      if (a.flip) [l, r] = [-r, -l];
      const lo = -half + 4 - l;
      const hi = half - 4 - r;
      return lo > hi ? x : Math.round(clamp(x, lo, hi));
   };
   const settle = (a: Actor, s: Spot): Spot => {
      const pose: Pose = s.seat ? "sit" : "idle";
      return {
         ...s,
         x: inside(a, s.x, pose),
         night: s.night === null ? null : inside(a, s.night, "sit"),
      };
   };
   // Changes stacking without ending a move (set() would end it).
   const depth = (a: Actor, z: number): void => {
      a.z = z;
      a.el.style.zIndex = String(z);
   };

   const him = stage.add("sagar", { z: 40 });
   marks.set(him, { ...spot(...L.him), z: 40 });
   for (const [id, fx, fy, scale, night] of L.cast) {
      // the ones right of him face left, toward him
      const a = stage.add(id, { scale, flip: fx > 0 });
      marks.set(a, settle(a, spot(fx, fy, night)));
   }
   const you = stage.add("visitor", { scale: L.you.scale });
   marks.set(you, settle(you, spot(...L.you.home)));
   const youMid = L.you.mid ? spot(...L.you.mid) : null;
   const youTarget = spot(...L.you.to);
   const crowd = stage.actors.filter((a) => a !== him && a !== you); // his friends
   const all = [...stage.actors];
   for (const a of all) homes.set(a, mark(a));

   let entered = false;
   let youOut = true; // the visitor is not on the rooftop yet
   let beat = 0;
   let disposed = false;
   const trip = {
      at: 0,
      want: 0,
      active: false,
      run: null as Promise<void> | null,
      rate: 1,
      by: 0,
   };
   const resetTrip = (): void => {
      Object.assign(trip, { at: 0, want: 0, active: false, rate: 1, by: 0 });
   };
   const homeTimer = new HeldTimer();

   const sitters = (): Actor[] => crowd.filter((a) => mark(a).seat);
   const standers = (): Actor[] => crowd.filter((a) => !mark(a).seat);
   const nearest = (a: Actor, list: readonly Actor[]): Actor | undefined =>
      list.reduce<Actor | undefined>(
         (b, c) => (!b || Math.abs(c.x - a.x) < Math.abs(b.x - a.x) ? c : b),
         undefined,
      );
   // Not the visitor while the email control has it.
   const free = (a: Actor): boolean => a !== you || !trip.active;

   /* ---------- the way in ----------
      Each friend's trip: where it starts (just out of sight past its own
      edge), the lane it hops along, how many hops and when it lands. The hop
      count and the start are chosen so that no touchdown on the way falls
      on a friend already standing there, and the landing waits until that
      friend has finished landing before the passer comes near: a crouch
      stacked behind a body reads as a pile-up, one long hop clean past a
      friend who is already standing reads as passing behind. */
   function entry(a: Actor, to: Spot, past: readonly number[]): Route {
      const side = Math.sign(to.x) || -1;
      const H = a.h;
      const out = span + a.w * 0.6;
      let best: (Route & { score: number }) | null = null;
      for (let n = 1; n <= 5; n++) {
         for (let extra = 0; extra <= H; extra += 4) {
            const x = side * (out + extra);
            const step = Math.abs(to.x - x) / n;
            if (step < 0.7 * H || step > 1.75 * H) continue;
            let clear = H;
            for (let j = 1; j < n; j++) {
               const cx = x + ((to.x - x) * j) / n;
               if (Math.abs(cx) > span) continue; // out of sight
               for (const px of past)
                  clear = Math.min(clear, Math.abs(cx - px));
            }
            // a touchdown 0.6 h from a friend is clear of even a landing pose
            const score =
               4 * Math.min(clear, 0.6 * H) -
               Math.abs(step - 1.05 * H) -
               0.2 * extra;
            if (!best || score > best.score)
               best = { score, x, hops: n, step, air: airOf(step) };
         }
      }
      if (best) return best;
      const x = side * out;
      const hops = Math.max(1, Math.round(Math.abs(to.x - x) / (1.05 * H)));
      const step = Math.abs(to.x - x) / hops;
      return { x, hops, step, air: airOf(step) };
   }
   // ms from the start of trip r until it first comes within reach of x.
   function reach(r: Route, x: number): number {
      const d = Math.abs(x - r.x);
      const i = Math.min(r.hops - 1, Math.floor(d / r.step));
      return (
         CROUCH + i * (r.air + CONTACT) + Math.min(1, d / r.step - i) * r.air
      );
   }
   function wayIn(): Trip[] {
      const side = (list: Actor[], sign: number, outsideIn: boolean) =>
         list
            .filter((a) => Math.sign(mark(a).x) === sign)
            .sort(
               (a, b) =>
                  (outsideIn ? 1 : -1) *
                  (Math.abs(mark(b).x) - Math.abs(mark(a).x)),
            );
      const zip = (l: Actor[], r: Actor[]): Actor[] =>
         [...l.flatMap((a, i) => [a, r[i]]), ...r.slice(l.length)].filter(
            (a): a is Actor => a !== undefined,
         );
      const order: [Actor, number][] = [
         ...zip(side(standers(), -1, true), side(standers(), 1, true)).map(
            (a): [Actor, number] => [a, G_STAND],
         ),
         ...zip(side(sitters(), -1, false), side(sitters(), 1, false)).map(
            (a, i): [Actor, number] => [a, i ? G_SIT : G_STAND],
         ),
         [you, G_YOU],
      ];
      const down: Trip[] = []; // trips that ended standing on the floor
      const trips: Trip[] = [];
      for (const [a, gap] of order) {
         const to = mark(a);
         const sign = Math.sign(to.x) || -1;
         const passes = down.filter(
            (d) =>
               Math.sign(d.to.x) === sign && Math.abs(d.to.x) > Math.abs(to.x),
         );
         const route = entry(
            a,
            to,
            passes.map((d) => d.to.x),
         );
         // ms to touchdown
         const touch =
            CROUCH + route.hops * route.air + (route.hops - 1) * CONTACT;
         // after the one before, never near a friend still landing, and no
         // touchdown beside one while it lands (two crouches side by side)
         const before = trips.at(-1);
         let slot = before ? before.slot + gap : 0;
         for (const d of passes) {
            slot = Math.max(
               slot,
               d.slot +
                  SETTLED +
                  touch -
                  reach(route, d.to.x + sign * 0.45 * d.a.h),
            );
            for (let j = 1; j < route.hops; j++) {
               const cx = route.x + ((to.x - route.x) * j) / route.hops;
               const tc =
                  slot - touch + CROUCH + j * route.air + (j - 1) * CONTACT;
               if (
                  Math.abs(cx - d.to.x) < 0.8 * d.a.h &&
                  tc + CONTACT > d.slot - 60 &&
                  tc < d.slot + SETTLED
               )
                  slot += d.slot + SETTLED - tc;
            }
         }
         const r: Trip = {
            a,
            to,
            y: to.seat ? 0 : to.y,
            z: to.z,
            ...route,
            touch,
            slot: Math.round(slot),
         };
         trips.push(r);
         if (!to.seat) down.push(r);
      }
      return trips;
   }
   // Before the entrance: he sits on the parapet at the centre; the others
   // wait past their own edge, on the lane they come in by.
   him.set({ x: 0, y: wallY, pose: "sit" });
   const route = wayIn();
   for (const r of route) r.a.set({ x: r.x, y: r.y, z: r.z, pose: "idle" });

   function onMarks(): void {
      for (const a of all) {
         const s = homes.get(a) ?? mark(a);
         marks.set(a, s);
         a.set({ x: s.x, y: s.y, z: s.z, pose: s.seat ? "sit" : "idle" });
      }
   }
   function still(): void {
      homeTimer.cancel();
      onMarks();
      him.set({ pose: "wave" });
      youOut = false;
      resetTrip();
   }

   /* ---------- moves ---------- */

   // Hops a to a spot (into the seat when it is one). Going up or back it
   // takes the new depth at once; coming down off the wall it takes it half
   // way, so its legs never cross a face in front.
   function go(a: Actor, to: Spot, o: HopOptions = {}): Promise<Actor> {
      const hop: HopOptions = { y: to.y, sit: to.seat, ...o };
      if (a.mode === "stand") depth(a, to.z);
      else
         stage
            .wait(a.hopTime(to.x, hop) * 0.4)
            .then(() => depth(a, to.z), noop);
      return a.hopTo(to.x, hop);
   }
   // A greeting: a wave on the floor. There is no seated wave frame, so on
   // the wall it is a small bounce in the seat (the engine's wake hop, which
   // stays in the sit frame) and a lean toward the one greeted. The fists-up
   // jump off the seat is kept for the cheer.
   const hey = (a: Actor, ms = 1000, to: Actor = you): Promise<Actor> => {
      if (a.mode === "stand") return a.wave(ms);
      const dir = Math.sign(to.x - a.x) || 1;
      return a
         .wake()
         .then(() =>
            a.nudge(dir * Math.round(a.h * 0.04), Math.max(640, ms * 0.7)),
         );
   };
   // The cheer's jump: the same air time for all, so it lands as one beat.
   // Sitters jump off the seat and land back on it.
   const leap = (a: Actor): Promise<Actor> =>
      a.jump({
         height: Math.round(
            a.h * (a.mode === "stand" ? 0.3 + 0.08 * a.seed : 0.16),
         ),
      });

   /* ---------- the show ---------- */

   async function entrance(s: Stage): Promise<void> {
      await s.wait(550);
      // he hops down off the parapet and waves at the reader
      const at = mark(him);
      const landed = him.hopTo(at.x, {
         y: at.y,
         height: Math.round(him.h * 0.2),
         air: 440,
      });
      // Every trip is timed by its touchdown, so the landings fall on their slots.
      const lead = Math.max(LEAD, ...route.map((r) => r.touch - r.slot));
      const arrivals = route.map((r) =>
         s.wait(lead + r.slot - r.touch).then(() => {
            if (r.a === you) {
               if (!youOut) return; // the email control already brought it in
               youOut = false;
            }
            return go(r.a, r.to, { hops: r.hops, air: r.air });
         }),
      );
      // a stop while he is still in the air must not leave these unhandled
      for (const p of arrivals) p.catch(noop);
      await landed;
      void him.wave(1500);
      await Promise.all(arrivals);
      // everyone greets the visitor, outward from him; the visitor waves back
      await s.wait(150);
      void him.wave(1300);
      await s.wait(220);
      await s.ripple(crowd, (a) => hey(a), { from: 0, step: 160 });
      if (free(you)) await you.wave(1300);
   }

   const BEATS: Record<SmallBeat, (s: Stage, k: number) => Promise<unknown>> = {
      // a sitter and the friend standing nearest below trade a greeting
      async trade(s, k) {
         const list = sitters();
         const up = list[k % list.length];
         const down = up && nearest(up, standers());
         if (!up || !down) return;
         await hey(up, 900, down);
         await s.wait(100);
         await down.wave(1200);
      },
      // two friends on one side swap places, one hopping past the other
      async swap(s, k) {
         const sign = k % 2 ? 1 : -1;
         const [a, b] = standers().filter((m) => Math.sign(mark(m).x) === sign);
         if (!a || !b) return BEATS.trade(s, k);
         const sa = mark(a);
         const sb = mark(b);
         marks.set(a, sb);
         marks.set(b, sa);
         await Promise.all([go(a, sb), s.wait(170).then(() => go(b, sa))]);
      },
      // he winks at the reader; the friends beside him lean in
      async wink(s) {
         void him.wink(1200);
         await s.wait(260);
         const near = standers().filter(
            (a) => Math.abs(mark(a).x) < span * 0.5,
         );
         await s.ripple(
            near,
            (a) => a.nudge(-Math.sign(a.x) * Math.round(a.h * 0.045), 900),
            { from: 0, step: 60 },
         );
      },
      // a friend hops up onto the wall as the one sitting there hops down
      async seatSwap(s, k) {
         const list = standers();
         const st = list[k % list.length];
         const up = st && nearest(st, sitters());
         if (!st || !up) return;
         const ss = mark(st);
         const su = mark(up);
         marks.set(st, su);
         marks.set(up, ss);
         await Promise.all([go(up, ss), s.wait(150).then(() => go(st, su))]);
      },
   };

   // The cheer: everyone jumps on one beat (the jump frame has both fists up;
   // the sitters hop off the seat and back), then the sitters sway; he waves.
   async function cheer(s: Stage): Promise<void> {
      void him.wave(1500);
      await s.wait(120);
      const crew = all.filter((a) => a !== him && free(a));
      await s.together(crew, (a) =>
         a.mode === "stand" ? leap(a) : leap(a).then(() => a.wave(700)),
      );
   }

   /* Left alone for 25 s, the night winds down; any input wakes it. */
   const quiet = (): boolean =>
      !trip.active && performance.now() - clock.last > QUIET_MS;
   async function night(s: Stage): Promise<void> {
      const t0 = performance.now();
      const woken = (): boolean => clock.last > t0;
      // the sitters doze off one by one, from the outside in
      for (const a of sitters().sort((p, q) => Math.abs(q.x) - Math.abs(p.x))) {
         if (woken()) return wakeUp(s);
         void a.sleep();
         await s.wait(1100);
      }
      // the friends standing hop up onto the wall, sit and doze
      const up = standers().sort((p, q) => Math.abs(q.x) - Math.abs(p.x));
      if (woken()) return wakeUp(s);
      for (const a of up) depth(a, 13);
      await s.arrive(up, (a) => mark(a).night ?? a.x, {
         y: wallY,
         sit: true,
         gap: 420,
      });
      for (const a of up) {
         if (woken()) return wakeUp(s);
         await s.wait(500);
         void a.sleep();
      }
      // he hops up last, sits a moment, and dozes
      await s.wait(900);
      if (woken()) return wakeUp(s);
      await him.hopTo(0, {
         y: wallY,
         sit: true,
         height: Math.round(him.h * 0.16),
      });
      await s.wait(1600);
      if (woken()) return wakeUp(s);
      await him.sleep();
      // the visitor (the reader, the only one still up) waves him good night
      await s.wait(600);
      if (woken()) return wakeUp(s);
      await you.wave(1500);
      // now only the window lights and the stars move
      while (!woken()) await s.wait(250);
      return wakeUp(s);
   }
   async function wakeUp(s: Stage): Promise<void> {
      // he wakes first, with a start; the rest wake outward from him
      if (him.mode !== "stand") await him.wake();
      await s.ripple(
         crowd.filter((a) => a.mode !== "stand"),
         (a) => a.wake(),
         { from: 0, step: 170 },
      );
      await s.wait(250);
      // and they hop back to their marks, him first
      const at = mark(him);
      if (him.mode !== "stand")
         await him.hopTo(at.x, {
            y: at.y,
            height: Math.round(him.h * 0.18),
            air: 420,
         });
      const back = standers().filter((a) => a.mode !== "stand");
      await s.ripple(back, (a) => go(a, mark(a)), { from: 0, step: 70 });
      clock.last = performance.now();
   }

   const run: Show = async (s) => {
      if (!entered) {
         entered = true;
         await entrance(s);
      }
      // rest (longer and uneven after the first beat), unless the night comes
      const ms = beat ? 5000 + ((beat * 0.618 + 0.4) % 1) * 2600 : 2400;
      for (let left = ms; left > 0 || trip.active; left -= 250) {
         if (quiet()) return night(s);
         await s.wait(250);
      }
      // small, cheer, small, small, cheer, ...: never the same beat twice running
      const k = beat++;
      if (k % 3 === 1) return cheer(s);
      const n = k - Math.floor((k + 1) / 3); // the small beats, in turn
      const small = L.smalls[n % L.smalls.length] ?? "trade";
      await BEATS[small](s, Math.floor(n / L.smalls.length));
   };

   /* ---------- the twist: the email control walks the visitor to him ----------
      want is the waypoint the control asks for: 0 its mark, 1 half way, 2 beside
      him (on his left). The visitor hops there with one hop per waypoint, the
      engine chaining them touch and go, and only ever sets off from rest (a hop
      already in the air lands first): a hold is one trip of two hops that
      touches down as the ring fills, sped up when it had to wait for a landing;
      a slide steps a waypoint at a time; a let-go waits for the landing and
      hops back. */
   function waypoint(i: number): Spot {
      const h = mark(you);
      if (i <= 0) return h;
      if (i >= 2) return youTarget;
      return (
         youMid ?? {
            x: Math.round((h.x + youTarget.x) / 2),
            y: Math.round((h.y + youTarget.y) / 2),
            seat: false,
            z: Math.round((h.z + youTarget.z) / 2),
            night: null,
         }
      );
   }
   function drive(): Promise<void> {
      trip.run ??= (async () => {
         // a gesture waits for a hop in the air to land: so this does too
         await you.face("right");
         while (trip.at !== trip.want) {
            const to = trip.want;
            const p = waypoint(to);
            const hops = Math.abs(to - trip.at); // from off stage (-1) that is one more
            const o: HopOptions = {
               y: p.y,
               hops,
               height: Math.round(you.h * 0.2),
               air: AIR,
            };
            // a hold touches down beside him as its ring fills
            if (trip.by) {
               const left = trip.by - performance.now();
               trip.rate =
                  left > 0
                     ? clamp((you.hopTime(p.x, o) - LIGHT) / left, 1, 2.2)
                     : 2.2;
            }
            depth(you, Math.max(p.z, you.z));
            trip.at = to;
            await you.hopTo(p.x, { ...o, rate: trip.rate });
         }
         depth(you, waypoint(trip.at).z);
      })()
         .catch(noop)
         .finally(() => {
            trip.run = null;
         });
      return trip.run;
   }
   function away(): void {
      homeTimer.cancel();
      clock.last = performance.now();
      trip.active = true;
   }
   async function goHome(): Promise<void> {
      trip.want = 0;
      trip.rate = 1;
      trip.by = 0;
      await drive();
      if (trip.want === 0) trip.active = false;
   }
   // He waves at the visitor, the visitor waves back, and the rest of the
   // rooftop cheers once (the visitor stands in front of a friend on phones,
   // so it does not crouch for a jump in the same spot).
   async function celebrate(): Promise<void> {
      if (!stage.reduced()) {
         void him.wave(1600);
         await stage.wait(380).catch(noop);
         if (disposed) return;
         void you.wave(1300);
         // everyone but those mid-hop (a jump would cut a hop short); a wave
         // or a nudge just gives way to the cheer
         stage
            .together(
               crowd.filter((a) => !a.travelling),
               leap,
            )
            .catch(noop);
      }
      homeTimer.start(HOME_MS, () => void goHome());
   }
   // Pressed before the visitor has come in, it comes in from the left edge
   // at once (one hop more) and the celebration waits for it to arrive.
   function takeVisitor(): void {
      away();
      if (!youOut) return;
      youOut = false;
      trip.at = -1;
   }
   async function copied(quick: boolean): Promise<void> {
      takeVisitor();
      if (quick) Object.assign(trip, { rate: 1.7, by: 0 });
      trip.want = 2;
      if (trip.at !== 2) await drive();
      if (!disposed) await celebrate();
   }

   const live = (fn: () => void): void => {
      if (!disposed) fn();
   };

   return {
      run,
      still,
      fromStill() {
         onMarks();
         entered = true;
         youOut = false;
      },
      hold(on) {
         homeTimer.hold(on);
      },
      dispose() {
         disposed = true;
         homeTimer.cancel();
      },
      email: {
         // press and hold: the visitor sets off at once, to touch down as
         // the ring fills ms later
         holdStart: (ms) =>
            live(() => {
               takeVisitor();
               trip.rate = 1;
               trip.by = performance.now() + ms;
               trip.want = 2;
               void drive();
            }),
         // let go before the hold completed: back to its mark
         holdCancel: () => live(() => void goHome()),
         // the hold completed (or a click: the trip made quickly); he waves
         // as the visitor touches down beside him
         copied: (quick) => live(() => void copied(quick)),
         // phones: the slide knob, 0 to 1
         slide: (p) =>
            live(() => {
               takeVisitor();
               Object.assign(trip, { rate: 1, by: 0 });
               trip.want = p >= 0.82 ? 2 : p >= 0.38 ? 1 : 0;
               void drive();
            }),
         slideEnd: (sent) => live(() => void (sent ? copied(false) : goHome())),
      },
   };
}
