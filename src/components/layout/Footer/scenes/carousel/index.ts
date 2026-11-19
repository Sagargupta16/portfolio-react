/* Footer scene "Around me", ported from the footer lab's draft C
   (carousel/carousel.js and controls.js).

   He stands still at the centre of a ring drawn on the floor. His people
   stand on marks round it, and on every beat the ring turns one mark
   clockwise: each of them hops to the next mark. Like a queue shuffling
   forward, the one ahead goes first and the one behind follows into the
   space it left, so the take-offs run round the ring against the turn, in
   two halves: one from the crossing behind him, one from the crossing in
   front. Nobody takes off towards someone coming the other way (round an
   end of the ring) until that one has landed, so no two cross in mid-air.
   Whoever crosses in front of him ducks into a crouch and scoots past his
   shins; whoever crosses behind him takes two small hops out of sight.
   Turn hops fly on the standing frame and land in a crouch; the fists-up
   jump frame is kept for the cheer.
   One pass of the show is a 12-beat cycle: three turns, a wave of hands
   round the ring (he answers), three turns, the cheer, three turns, a wave.
   The wide layout has nine marks, so one cycle is one full turn of the ring.

   The visitor (the one in blue) is on the ring too. Hold the email control,
   or slide it on a phone, and the ring stops on the beat, the friends on the
   visitor's side step back, and the visitor hops in beside him.
   Left alone for 30 s the beat slows, then everyone rests facing out; any
   input brings the pulse back with a cheer.

   Depth: the engine places and hops actors in screen space. This scene adds
   the ring's depth on top of it, as the CSS `scale` and `opacity` of each
   actor's lift layer and the `scale` of its shadow (both pivot on the
   ground point), animated across each hop, and a z-index set at take-off. */

import {
   type Actor,
   type CastMemberId,
   type HopOptions,
   loadTroupe,
   type Pose,
   type Stage,
} from "../cast";
import type { FooterSceneMount } from "../types";
import { LOADING, type LoadState } from "@/types/loadState";
import {
   AVOID,
   BEAT,
   clamp,
   CROUCH,
   CYCLE,
   DUCK,
   HOLD,
   HOLD_GRACE,
   type Layout,
   NARROW,
   RATE,
   REST_AFTER,
   type Side,
   SLOW_AFTER,
   SLOW_OVER,
   STEP,
   TAIL,
   WAVE_STEP,
   WIDE,
   WIDE_QUERY,
} from "./layout";
import { createRing, drawRing } from "./ring";
import "./carousel.css";

const noop = (): void => {};
// One parabola split at its apex (the engine's own pair).
const RISE = "cubic-bezier(0.33, 0.67, 0.67, 1)";
const FALL = "cubic-bezier(0.33, 0, 0.67, 0.33)";
// A rebuild waits for the size to settle.
const REBUILD_MS = 200;
// Room kept above his head inside the stage.
const HEADROOM = 22;
// Input that counts as someone being there.
const INPUT_EVENTS = [
   "pointerdown",
   "pointermove",
   "keydown",
   "wheel",
   "touchstart",
   "scroll",
] as const;

/** A point on the floor and what standing there means: size s, opacity o
    and layer z, from its depth d (-1 the back of the ring, 1 the front). */
interface Spot {
   x: number;
   y: number;
   d: number;
   s: number;
   o: number;
   z: number;
}
interface Mark extends Spot {
   /** Angle round the ring, clockwise as seen: 0 the right end, 90 the
       front. */
   phi: number;
   id: CastMemberId;
}

/** A move under way, and the moment its feet touch down. */
interface Trip {
   done: Promise<unknown>;
   touch: number;
}

/** calm: flies on the standing frame; shuffle: no low frames either. */
type TripKind = "calm" | "shuffle";
interface TripOptions {
   /** ms per hop, as seen. */
   air?: number;
   height?: number;
   hops?: number;
   rate?: number;
   land?: Pose;
   kind?: TripKind;
}

/** How a visit was started: the desktop hold (one bound) or the phone's
    slide (two thresholds). */
type VisitMode = "hold" | "slide";
/** Where the visit stands: under way, copied (or mail opening), or let go. */
type VisitEnd = "open" | "copied" | "cancelled";
interface Visit {
   /** A call the show has not taken up yet. */
   want: boolean;
   end: VisitEnd;
   /** How far in the visitor is asked to be: a stop on its path. */
   target: number;
   /** The scene clock when the hold began. */
   at: number;
   mode: VisitMode;
   /** ms the hold takes to fill. */
   hold: number;
}

/** What a round of the show needs from the scene around it. */
interface Env {
   stage: Stage;
   ring: SVGSVGElement;
   visit: Visit;
   /** The scene clock: stops while the stage is held. */
   clock: () => number;
   /** ms since the last input, on the scene clock. */
   idleMs: () => number;
   /** A Web Animation the scene holds and cancels with its own. */
   animate: (el: HTMLElement, keyframes: Keyframe[], ms: number) => Animation;
   /** A pausable timeout for the Reduced still (one at a time). */
   later: (ms: number, fn: () => void) => void;
}

/** One layout's cast and show, built for one stage size. */
interface Round {
   lay: Layout;
   half: number;
   height: number;
   show: (s: Stage) => Promise<void>;
   /** Reduced: everyone on their marks, facing him, and he waves. */
   still: () => void;
   /** The visitor beside him for a moment (Reduced). */
   visitStill: (mode: VisitMode) => void;
   /** Back from the still: everyone on their marks and the loop goes on
       from there, with no entrance. */
   resume: () => void;
   /** A turn cut short hands out its remaining marks at once. */
   settleTurn: () => void;
}

/* ---- one round: the ring, the cast and the show for one layout ---- */
function createRound(
   env: Env,
   lay: Layout,
   half: number,
   height: number,
): Round {
   const { stage, ring, visit } = env;
   const rx = Math.round(lay.rx(half));
   const ry = lay.ry;
   stage.floor = ry + lay.floor;
   stage.unit = Math.round(
      Math.min(lay.him(half), height - stage.floor - HEADROOM),
   );

   const at = new Map<Actor, number>(); // actor -> index of its mark
   const sized = new Map<Actor, Spot>(); // actor -> the point its depth is set for
   const depthAnims = new Map<Actor, Animation[]>();
   const ringHop = new Map<Actor, Promise<unknown>>(); // actor -> its move in the latest turn
   // Marks taken at take-off; a turn cut short (Reduced, a new layout) hands
   // out the rest at once, so two are never given one mark.
   const unmoved = new Map<Actor, number>();
   let path: Spot[] = []; // the visitor's way in, while a visit runs
   let entered = false;
   let answers = 0;

   // A point on the floor: its depth d gives the size, the dim and the
   // layer of whoever stands there.
   const point = (x: number, y: number): Spot => {
      const d = clamp(-y / ry, -1, 1);
      const k = (d + 1) / 2;
      // dim is opacity, so a back-row friend is a touch see-through: keep it light
      return {
         x: Math.round(x),
         y: Math.round(y * 10) / 10,
         d,
         s: +(lay.back + (1 - lay.back) * k).toFixed(3),
         o: +(0.86 + 0.14 * k).toFixed(3),
         z: 30 + Math.round(d * 9),
      };
   };
   const onRing = (f: number, side: Side): Spot =>
      point(f * rx, -side * Math.sqrt(Math.max(0, 1 - f * f)) * ry);
   const phiOf = (f: number, side: Side): number => {
      const a = (Math.acos(clamp(f, -1, 1)) * 180) / Math.PI;
      return side < 0 || (side === 0 && f > 0) ? 360 - a : a;
   };
   // the frames as drawn face right
   const faceIn = (x: number): "left" | "right" => (x < 0 ? "right" : "left");

   // Marks, clockwise from the front left one (mark 0).
   const sorted: Mark[] = lay.marks
      .map(([f, side, id]) => ({
         ...onRing(f, side),
         phi: phiOf(f, side),
         id,
      }))
      .sort((a, b) => a.phi - b.phi);
   const first = Math.max(
      0,
      sorted.findIndex((m) => m.phi > 90),
   );
   const M = [...sorted.slice(first), ...sorted.slice(0, first)];
   const mark = (a: Actor): Mark => M[at.get(a) ?? 0];

   // Sizes, dims and layers an actor for point p, animating the change over
   // the part [span] of a move that lasts ms (a hop's time in the air).
   const depth = (
      a: Actor,
      p: Spot,
      ms = 0,
      span: readonly [number, number] = [0, 1],
   ): void => {
      const from = sized.get(a);
      sized.set(a, p);
      for (const x of depthAnims.get(a) ?? []) x.cancel();
      depthAnims.delete(a);
      const { lift, shadow } = a.parts;
      lift.style.scale = String(p.s);
      lift.style.opacity = String(p.o);
      shadow.style.scale = String(p.s);
      if (!(ms > 0) || !from || (from.s === p.s && from.o === p.o)) return;
      const s1 = clamp(span[1], 0, 1);
      const s0 = clamp(span[0], 0, s1);
      const keys = (v0: number, v1: number, o0?: number, o1?: number) => {
         const k = (offset: number, v: number, o?: number): Keyframe =>
            o === undefined
               ? { offset, scale: String(v) }
               : { offset, scale: String(v), opacity: o };
         return [k(0, v0, o0), k(s0, v0, o0), k(s1, v1, o1), k(1, v1, o1)];
      };
      depthAnims.set(a, [
         env.animate(lift, keys(from.s, p.s, from.o, p.o), ms),
         env.animate(shadow, keys(from.s, p.s), ms),
      ]);
   };

   /* ---- the cast ---- */
   const him = stage.add("sagar", { x: 0, y: 0, z: 30 });
   const crowd = M.map((m, k) => {
      const a = stage.add(m.id, {
         x: m.x,
         y: m.y,
         z: m.z,
         scale: lay.crowd,
         flip: m.x > 0,
         avoid: AVOID[m.id],
      });
      at.set(a, k);
      depth(a, m);
      return a;
   });
   const you = crowd.find((a) => a.id === "visitor");
   if (!you) throw new Error("carousel: the layout has no visitor mark");
   const byMark = (): Actor[] =>
      [...crowd].sort((a, b) => (at.get(a) ?? 0) - (at.get(b) ?? 0));
   drawRing(ring, rx, ry, stage.floor, M);

   // The engine flies every hop on the jump frame (fists up). That frame is
   // kept for the cheer: every other move flies on the standing frame, by
   // leaving the jump frame out for the one synchronous call that plans the
   // hop (hopTo builds its pose track before it returns). A shuffle also
   // leaves out the low frames, so the engine squashes the standing frame.
   const SKIP: Record<TripKind, readonly Pose[]> = {
      calm: ["jump"],
      shuffle: ["jump", "crouch", "land"],
   };
   const framesOut = <R>(a: Actor, skip: readonly Pose[], fn: () => R): R => {
      const added = skip.filter((p) => !a.avoid.has(p));
      for (const p of added) a.avoid.add(p);
      try {
         return fn();
      } finally {
         for (const p of added) a.avoid.delete(p);
      }
   };
   // A move to point p, planned: the engine's options, the whole time, the
   // moment the feet touch down and the crouch before take-off.
   const hopOf = (a: Actor, p: Spot, o: TripOptions = {}) => {
      const r = o.rate ?? RATE;
      const kind = o.kind ?? "calm";
      const land = o.land ?? (kind === "shuffle" ? "idle" : "crouch");
      const hop: HopOptions = {
         y: p.y,
         hops: o.hops ?? 1,
         height: o.height ?? a.h * 0.12,
         air: (o.air ?? 360) * r,
         rate: r,
         land,
      };
      const skip = SKIP[kind];
      const ms = framesOut(a, skip, () => a.hopTime(p.x, hop));
      const tail = land === "idle" ? TAIL.idle : TAIL.low;
      return { hop, skip, ms, touch: ms - tail / r, c: CROUCH / r };
   };
   // One move to point p, with the depth following it through the air and
   // the layer taken at take-off.
   const travel = (a: Actor, p: Spot, o: TripOptions = {}): Trip => {
      a.set({ z: p.z }); // also wraps up any move still running
      const t = hopOf(a, p, o);
      const done = framesOut(a, t.skip, () => a.hopTo(p.x, t.hop));
      depth(a, p, t.ms, [t.c / t.ms, t.touch / t.ms]);
      return { done, touch: t.touch };
   };
   // Across his front he must stay in view: the friend drops into its crouch
   // (the frame every hop takes off from), scoots past his shins in two
   // small bounces, then stands up on the far side facing him.
   const duck = (a: Actor, p: Spot, D: number): Trip => {
      a.set({ z: p.z });
      const { lift, squash } = a.parts;
      a.pose("crouch");
      const b = `0px ${-Math.round(a.h * 0.045)}px`;
      const rest = "0px 0px";
      env.animate(squash, [{ scale: "1.05 0.94" }, { scale: "1 1" }], 160);
      env.animate(
         lift,
         [
            { translate: rest, easing: RISE },
            { translate: b, offset: 0.27, easing: FALL },
            { translate: rest, offset: 0.5, easing: RISE },
            { translate: b, offset: 0.73, easing: FALL },
            { translate: rest },
         ],
         D,
      );
      depth(a, p, D, [0.15, 0.85]);
      const done = a.moveTo(p.x, p.y, D).then(() => {
         a.pose("idle");
         env.animate(
            squash,
            [
               { scale: "1.04 0.94" },
               { scale: "0.98 1.03", offset: 0.45 },
               { scale: "1 1" },
            ],
            240,
         );
         return a.face(faceIn(p.x));
      });
      return { done, touch: D };
   };
   // A move to p by the way that keeps him in view: a way across his front
   // ducks past his shins, a way behind him goes in two hops out of sight,
   // anything else is one hop.
   const go = (a: Actor, p: Spot, o: TripOptions = {}): Trip => {
      if (Math.sign(a.x) === Math.sign(p.x)) return travel(a, p, o);
      const y0 = a.y + ((p.y - a.y) * (0 - a.x)) / (p.x - a.x);
      if (y0 < 0)
         return duck(a, p, clamp(Math.abs(p.x - a.x) * 1.25, DUCK[0], DUCK[1]));
      const t = travel(a, p, { ...o, hops: 2 });
      return { done: t.done.then(() => a.face(faceIn(p.x))), touch: t.touch };
   };

   // Before the entrance: the cast waits past the nearer screen edge, each
   // at its own mark's depth; he waits above the top.
   const offstage = (): void => {
      for (const a of crowd) {
         const m = mark(a);
         const side = m.x < 0 ? -1 : 1;
         a.set({
            x: side * Math.round(half + a.w * 0.62),
            y: m.y,
            z: m.z,
            flip: side > 0,
            pose: "idle",
         });
         depth(a, m);
      }
      him.set({ x: 0, y: height - stage.floor + 30, pose: "idle" });
   };
   const onMarks = (): void => {
      for (const a of crowd) {
         const m = mark(a);
         a.set({ x: m.x, y: m.y, z: m.z, flip: m.x > 0, pose: "idle" });
         depth(a, m);
      }
      him.set({ x: 0, y: 0, z: 30, pose: "idle" });
      him.parts.shadow.style.scale = "1";
   };
   const still = (): void => {
      onMarks();
      him.set({ pose: "wave" });
   };
   // Where the visitor stands beside him, on its own side, a step in front.
   const besideSpot = (side: number): Spot => {
      const s = point(0, -0.24 * ry).s;
      return point(
         side * Math.round(him.w * 0.27 + you.w * s * 0.25 + 16),
         -0.24 * ry,
      );
   };
   const visitStill = (mode: VisitMode): void => {
      still();
      const p = besideSpot(you.x < 0 ? -1 : 1);
      you.set({ x: p.x, y: p.y, z: p.z });
      depth(you, p);
      env.later(mode === "slide" ? 1600 : 2000, () => {
         if (stage.reduced()) still();
      });
   };

   /* ---- helpers for the show ---- */
   // A pausable wait that ends early when the visitor is called.
   const hold = async (ms: number): Promise<void> => {
      for (let t = 0; t < ms && !visit.want; t += 80)
         await stage.wait(Math.min(80, ms - t));
   };
   const beatMs = (): number =>
      BEAT * (1 + 0.85 * clamp((env.idleMs() - SLOW_AFTER) / SLOW_OVER, 0, 1));
   // A pausable wait for p that gives up early once stop() says so; a stop
   // (STOPPED) still ends the show.
   const until = async (
      s: Stage,
      p: Promise<unknown>,
      stop: () => boolean,
   ): Promise<void> => {
      let done = false;
      let failed = false;
      let err: unknown = null;
      p.then(
         () => {
            done = true;
         },
         (e: unknown) => {
            failed = true;
            err = e;
            done = true;
         },
      );
      while (!done && !stop()) await s.wait(40);
      if (failed) throw err;
   };
   const called = (): boolean => visit.want && visit.target > 0;
   // The email events change the visit while the show awaits: read it fresh.
   const ended = (e: VisitEnd): boolean => visit.end === e;

   /* ---- the beats ---- */
   interface Plan {
      a: Actor;
      k: number;
      p1: Mark;
      kind: "hop" | "duck" | "behind";
      o: TripOptions;
      dx: number;
      t: ReturnType<typeof hopOf>;
      leave: number;
      run: () => Trip;
   }
   // The timetable of one turn, by mark (people move through the marks; the
   // timetable belongs to the marks). Two queues, one behind each crossing of
   // the centre: in each, a mover leaves STEP after the one ahead of it (whose
   // mark it takes), or, where the two go opposite ways (round an end of the
   // ring), once the one ahead has landed, so they never cross in mid-air.
   // A crossing leaves its mark vacate ms before the one behind lands on it
   // and arrives clear ms after the one ahead has left. The queue behind the
   // crossing at the back starts the turn; the queue behind the duck starts
   // when the duck, at its own quick pace, arrives just in time.
   const timetable = (order: readonly Actor[]): Plan[] => {
      const n = order.length;
      const mv: Plan[] = order.map((a, k) => {
         const p0 = M[k];
         const p1 = M[(k + 1) % n];
         const across = Math.sign(p0.x) !== Math.sign(p1.x);
         const kind = across ? (p1.d > 0 ? "duck" : "behind") : "hop";
         // round an end of the ring (a row change): lower, it passes close to a neighbour
         const o: TripOptions =
            Math.sign(p0.d) !== Math.sign(p1.d)
               ? { air: 330, height: a.h * 0.1 }
               : { air: 360, height: a.h * 0.15 };
         const plan: Plan = {
            a,
            k,
            p1,
            kind,
            o,
            dx: p1.x - p0.x,
            t: hopOf(a, p1, o),
            leave: 0,
            run: () => travel(a, p1, plan.o),
         };
         return plan;
      });
      const c = CROUCH / RATE;
      const behind = (x: Plan): Plan => mv[(x.k - 1 + n) % n];
      const ahead = (x: Plan): Plan => mv[(x.k + 1) % n];
      const queue = (x: Plan, start: number): void => {
         let lead: Plan | null = null;
         for (
            let m = behind(x), i = 0;
            m.kind === "hop" && i < n;
            m = behind(m), i++
         ) {
            m.leave = !lead
               ? start
               : Math.sign(m.dx) === Math.sign(lead.dx)
                 ? lead.leave + STEP
                 : lead.leave + lead.t.touch - c + 30;
            lead = m;
         }
      };
      const back = mv.find((m) => m.kind === "behind");
      const front = mv.find((m) => m.kind === "duck");
      if (!back || !front) {
         mv.forEach((m, i) => (m.leave = i * STEP));
         return mv;
      }
      queue(back, 0);
      // the duck: on its next mark clear ms after that mark's owner left
      const arrive = ahead(front).leave + c + lay.clear;
      const D0 = DUCK[0] + 40;
      const next = behind(front);
      queue(front, Math.max(0, arrive - D0 - next.t.touch + lay.vacate));
      front.leave = Math.max(0, next.leave + next.t.touch - lay.vacate);
      const D = clamp(arrive - front.leave, DUCK[0], DUCK[1]);
      front.run = () => duck(front.a, front.p1, D);
      // behind him: small hops, the middle contacts hidden by him
      const prev = behind(back);
      back.leave = Math.max(0, prev.leave + prev.t.touch - lay.vacate - c);
      const need = ahead(back).leave + c + lay.clear - back.leave;
      const hops = need > 900 ? 3 : 2;
      back.o = {
         hops,
         air: clamp((need - c - (80 / RATE) * (hops - 1)) / hops, 280, 480),
         height: back.a.h * 0.1,
      };
      back.run = () => {
         const t = travel(back.a, back.p1, back.o);
         return {
            done: t.done.then(() => back.a.face(faceIn(back.p1.x))),
            touch: t.touch,
         };
      };
      const t0 = Math.min(...mv.map((m) => m.leave));
      for (const m of mv) m.leave -= t0;
      return mv;
   };

   const settleTurn = (): void => {
      for (const [a, k] of unmoved) at.set(a, k);
      unmoved.clear();
   };
   // Everyone moves one mark clockwise, on the timetable. A turn always
   // finishes (two on one mark is never allowed), but the visitor, called in
   // before its own take-off, stays out of it (its place in the ring moves on
   // without it) and the show goes to the visit as soon as the visitor is free.
   const turn = async (s: Stage): Promise<void> => {
      const n = M.length;
      const mv = timetable(byMark());
      settleTurn();
      for (const m of mv) unmoved.set(m.a, (m.k + 1) % n);
      let youFree = false;
      const moves = mv.map((m) => {
         const leave = (): void => {
            at.set(m.a, (m.k + 1) % n);
            unmoved.delete(m.a);
         };
         const mine =
            m.a === you
               ? (async () => {
                    for (let t = 0; t < m.leave && !called(); t += 40)
                       await s.wait(Math.min(40, m.leave - t));
                    leave();
                    if (!called()) await m.run().done;
                 })()
               : s.wait(m.leave).then(() => {
                    leave();
                    return m.run().done;
                 });
         mine.catch(noop);
         ringHop.set(m.a, mine);
         if (m.a === you)
            mine.then(() => {
               youFree = true;
            }, noop);
         return mine;
      });
      await until(s, Promise.all(moves), () => visit.want && youFree);
   };
   // A wave of hands goes round the ring, each at him in turn; he answers.
   const waveRound = async (s: Stage): Promise<void> => {
      const order = byMark();
      const reply = hold((order.length - 1) * WAVE_STEP + 240).then(() =>
         visit.want ? null : answers++ % 2 ? him.wave(1300) : him.wink(1100),
      );
      reply.catch(noop);
      const waves = s.together(order, (a, i) =>
         hold(i * WAVE_STEP).then(() => (visit.want ? null : a.wave(900))),
      );
      await until(s, Promise.all([waves, reply]), () => visit.want);
   };
   // Everyone jumps on the same instant (the one fists-up frame); he raises his hand.
   const jumpAll = (s: Stage): Promise<Actor[]> =>
      s.together(crowd, (a) =>
         a.jump({ height: Math.round(a.h * 0.3), air: 440 }),
      );
   const cheer = async (s: Stage): Promise<void> => {
      void him.wave(1400);
      await s.wait(160);
      await jumpAll(s);
   };

   /* ---- the entrance ---- */
   const entrance = async (s: Stage): Promise<void> => {
      offstage();
      // He drops in from above: a fall from rest (lift h = drop / 4 over a
      // linear descent is exactly y = drop (1 - t^2)), landing with weight.
      const drop = him.y;
      const rate = 0.85;
      const fall: HopOptions = {
         y: 0,
         hops: 1,
         height: drop / 4,
         air: 560 * rate,
         rate,
         land: "land",
      };
      const ms = him.hopTime(0, fall);
      const landed = him.hopTo(0, fall);
      const touch = CROUCH / rate + 560; // the moment his feet meet the floor
      const shadow = him.parts.shadow;
      shadow.style.scale = "1";
      const t1 = Math.min(1, touch / ms);
      env.animate(
         shadow,
         [
            { scale: "0" },
            { scale: "0", offset: t1 },
            {
               scale: "1",
               offset: Math.min(1, Math.max(t1, (touch + 110) / ms)),
            },
            { scale: "1" },
         ],
         ms,
      );
      // The cast hops in from both edges and lands one after another: the
      // back row first, then the ends of the ring, then the front row; inner
      // marks first, so nobody passes anybody on their own row. Each side
      // files in at one ground speed with its entries spaced, so no clump.
      const row = (m: Spot): number => (m.d < -0.05 ? 0 : m.d > 0.05 ? 2 : 1);
      const order = [...crowd].sort((a, b) => {
         const p = mark(a);
         const q = mark(b);
         return row(p) - row(q) || Math.abs(p.x) - Math.abs(q.x) || p.x - q.x;
      });
      const GAP = lay === WIDE ? 180 : 230; // between landings
      const SPACING = 360; // between entries on one side
      const lastStart = new Map<number, number>();
      let landing = 850 - GAP;
      const plan = order.map((a) => {
         const p = mark(a);
         const side = p.x < 0 ? -1 : 1;
         const hop: HopOptions = {
            y: p.y,
            speed: 0.6,
            height: a.h * 0.16,
            land: "crouch",
         };
         // to the moment of landing
         const travelMs =
            framesOut(a, SKIP.calm, () => a.hopTime(p.x, hop)) - TAIL.low;
         const start = Math.max(
            150,
            landing + GAP - travelMs,
            (lastStart.get(side) ?? -1e9) + SPACING,
         );
         lastStart.set(side, start);
         landing = start + travelMs;
         return { a, p, hop, start };
      });
      const wave = s.wait(landing - 80).then(() => him.wave(1300));
      wave.catch(noop);
      await Promise.all(
         plan.map((q) =>
            s
               .wait(q.start)
               .then(() =>
                  framesOut(q.a, SKIP.calm, () => q.a.hopTo(q.p.x, q.hop)),
               ),
         ),
      );
      await landed;
      await until(s, wave, () => visit.want);
   };

   /* ---- the visitor comes in ---- */
   // Home is the visitor's mark. Called in before its move of a turn, it is
   // still on the mark it was leaving: it goes home once the turn is done.
   const goHome = async (o?: TripOptions): Promise<void> => {
      const home = mark(you);
      if (you.x === home.x && you.y === home.y) return;
      await Promise.all(crowd.map((a) => ringHop.get(a)));
      await go(you, home, o).done;
   };
   // One step back from him, along the line from him to the mark.
   const outward = (a: Actor): Spot => {
      const m = mark(a);
      const dx = Math.sign(m.x) * rx * (lay === WIDE ? 0.12 : 0.22);
      return point(
         clamp(m.x + dx, -half + a.w * 0.3, half - a.w * 0.3),
         m.y * 1.18,
      );
   };
   // Desktop: one bound, timed to land as the hold fills. Phone: the knob
   // moves the visitor one short hop at a time.
   const tripHop = (inward: boolean): TripOptions => {
      if (path.length === 2 && inward) {
         const left = visit.hold - (env.clock() - visit.at) - CROUCH;
         return { air: clamp(left, 320, 520), height: you.h * 0.24, rate: 1 };
      }
      return { air: 280, height: you.h * 0.12, rate: 1.15 };
   };
   const visitFlow = async (s: Stage): Promise<void> => {
      visit.want = false;
      if (ended("cancelled")) return goHome();
      // It sets off from where it stands: its mark, or, if it was called in
      // before its move of the turn, the mark it was leaving.
      const side = you.x < 0 ? -1 : 1;
      const from = point(you.x, you.y);
      const spot = besideSpot(side);
      const mid = point((from.x + spot.x) / 2, (from.y + spot.y) / 2);
      const slide = visit.mode === "slide";
      path = slide ? [from, mid, spot] : [from, spot];
      const last = path.length - 1;
      // The friends on that side side-step away from him to open the way,
      // nearest the visitor first, each once its own move of the turn is done.
      const opened = new Set<Actor>();
      const away = s.together(
         crowd.filter((a) => a !== you),
         (a) =>
            (ringHop.get(a) ?? Promise.resolve()).then(() => {
               if (side * mark(a).x <= 0) return;
               opened.add(a);
               return s.wait((Math.abs(mark(a).x - from.x) / 100) * 60).then(
                  () =>
                     travel(a, outward(a), {
                        kind: "shuffle",
                        air: 240,
                        height: a.h * 0.04,
                        rate: 1,
                     }).done,
               );
            }),
      );
      away.catch(noop);
      let wp = 0;
      for (;;) {
         visit.want = false; // a press during the visit belongs to this visit
         if (
            visit.mode === "hold" &&
            ended("open") &&
            env.clock() - visit.at > visit.hold + HOLD_GRACE
         )
            Object.assign(visit, { end: "cancelled", target: 0 });
         const copied = ended("copied");
         const target = copied ? last : clamp(visit.target, 0, last);
         if (wp !== target) {
            const next = wp + Math.sign(target - wp);
            const spotNext = path[next];
            const hop = travel(you, spotNext, tripHop(next > wp));
            // the last hop counts from the moment the visitor's feet land
            await (next === last ? s.wait(hop.touch) : hop.done);
            wp = next;
         } else if ((copied && wp === last) || (ended("cancelled") && wp === 0))
            break;
         else await s.wait(40);
      }
      if (ended("copied")) {
         // he waves at the visitor; once everyone is at rest, all cheer on one
         // instant; a beat later all go home
         void him.wave(1500);
         await s.wait(300);
         await Promise.all([away, ...crowd.map((a) => ringHop.get(a))]);
         await jumpAll(s);
         await s.wait(slide ? 380 : 780);
      } else await away;
      // back the way it came, but to its mark, which may have moved on
      const back = path.slice(1, wp).reverse();
      await s.together([you, ...opened], async (a) => {
         if (a !== you)
            return travel(a, mark(a), {
               kind: "shuffle",
               air: 280,
               height: a.h * 0.05,
               rate: 1,
            }).done;
         for (const p of back)
            await travel(you, p, { air: 300, height: you.h * 0.14, rate: 1.15 })
               .done;
         await goHome({ air: 340, height: you.h * 0.14, rate: 1.15 });
      });
      path = [];
   };

   /* ---- left alone: everyone rests facing out; any input wakes them ---- */
   const rest = async (s: Stage): Promise<void> => {
      await s.ripple(crowd, (a) => a.face(a.x < 0 ? "left" : "right"), {
         from: 0,
         step: 70,
      });
      while (env.idleMs() > 1500 && !visit.want) await s.wait(250);
      await s.ripple(crowd, (a) => a.face(faceIn(a.x)), { from: 0, step: 40 });
      await cheer(s);
      await s.wait(500);
   };

   /* ---- the show: one pass is one cycle of twelve beats ---- */
   const show = async (s: Stage): Promise<void> => {
      if (!entered) {
         entered = true;
         await entrance(s);
         await hold(500);
      }
      for (const beat of CYCLE) {
         if (visit.want) await visitFlow(s);
         if (env.idleMs() > REST_AFTER) await rest(s);
         const t0 = env.clock();
         if (beat === "T") await turn(s);
         else if (beat === "W") await waveRound(s);
         else await cheer(s);
         await hold(beatMs() - (env.clock() - t0));
      }
   };

   if (stage.reduced()) still();
   else offstage();

   return {
      lay,
      half,
      height,
      show,
      still,
      visitStill,
      resume: () => {
         onMarks();
         entered = true;
         path = [];
      },
      settleTurn,
   };
}

/* ---- the scene ---- */
export const mount: FooterSceneMount<"carousel"> = (host, ctx) => {
   // The engine's stage gets an element of its own; the ring lies under the
   // cast inside it.
   const root = document.createElement("div");
   root.className = "cr-stage";
   root.setAttribute("aria-hidden", "true");
   const ring = createRing();
   root.append(ring);
   host.append(root);

   let dead = false;
   let reduced = ctx.reduced;
   let visible = false;
   let announced = false;
   let stage: Stage | null = null;
   let round: Round | null = null;
   // Whose strips are in: the round on stage once its ready() is through.
   let art: LoadState<Round> = LOADING;
   let running = false;
   let plays = 0;

   /* ---- the scene clock, which stops while the stage is held, and our
      own animations (depth, the duck's bounces) ---- */
   // Held from the start: the shell shows the stage only after ready().
   let pausedAt: number | null = performance.now();
   let pausedFor = 0;
   const clock = (): number => {
      const now = performance.now();
      return now - pausedFor - (pausedAt === null ? 0 : now - pausedAt);
   };
   const own = new Set<Animation>();
   const animate = (
      el: HTMLElement,
      keyframes: Keyframe[],
      ms: number,
   ): Animation => {
      // end states are inline
      const a = el.animate(keyframes, { duration: ms, fill: "none" });
      own.add(a);
      const drop = (): void => {
         own.delete(a);
      };
      a.addEventListener("finish", drop);
      a.addEventListener("cancel", drop);
      if (pausedAt !== null) a.pause();
      return a;
   };
   const cancelOwn = (): void => {
      for (const a of [...own]) a.cancel();
   };

   // One pausable timeout (the Reduced still's reset).
   let later: { fn: () => void; left: number; at: number; id: number } | null =
      null;
   const arm = (): void => {
      if (!later || pausedAt !== null) return;
      const t = later;
      t.at = performance.now();
      t.id = window.setTimeout(() => {
         if (later === t) later = null;
         t.fn();
      }, t.left);
   };
   const clearLater = (): void => {
      if (later) clearTimeout(later.id);
      later = null;
   };

   /* ---- left alone: the idle clock runs on the scene clock and listens
      only while the stage is in view ---- */
   let lastInput = 0;
   const onInput = (): void => {
      lastInput = clock();
   };
   const listen = (on: boolean): void => {
      for (const ev of INPUT_EVENTS) {
         if (on)
            window.addEventListener(ev, onInput, {
               passive: true,
               capture: true,
            });
         else window.removeEventListener(ev, onInput, { capture: true });
      }
   };

   /* ---- the visitor's trip, driven by the email control ---- */
   const visit: Visit = {
      want: false,
      end: "open",
      target: 0,
      at: 0,
      mode: "hold",
      hold: HOLD,
   };
   const resetVisit = (): void => {
      Object.assign(visit, { want: false, end: "open", target: 0 });
   };
   // The hold has started, or the knob has begun to slide.
   const press = (mode: VisitMode, ms: number): void => {
      if (!round || reduced) return;
      Object.assign(visit, {
         want: true,
         end: "open",
         at: clock(),
         target: mode === "hold" ? 1 : 0,
         mode,
         hold: ms,
      });
   };
   // Phone: the knob's place (0 to 1) picks how far in the visitor is: it
   // sets off as soon as the knob starts to slide.
   const progress = (p: number): void => {
      if (visit.end !== "copied")
         visit.target = p >= 0.6 ? 2 : p >= 0.15 ? 1 : 0;
   };
   // Let go early: the visitor goes back, nothing was copied.
   const cancel = (): void => {
      Object.assign(visit, { end: "cancelled", target: 0 });
      if (reduced) round?.still();
   };
   // Copied (or mail opening): the visitor comes all the way, and the cheer.
   const done = (mode: VisitMode): void => {
      if (!round) return;
      // Reduced: no trip, the visitor is simply there beside him for a moment
      if (reduced) {
         round.visitStill(mode);
         return;
      }
      Object.assign(visit, {
         want: true,
         end: "copied",
         target: mode === "slide" ? 2 : 1,
         mode,
      });
   };
   let sliding = false;

   /* ---- start, hold, Reduced and rebuilds ---- */
   const run = (): void => {
      const r = round;
      if (
         dead ||
         running ||
         !visible ||
         reduced ||
         !stage ||
         !r ||
         art.status !== "ready" ||
         art.data !== r
      )
         return;
      running = true;
      const id = ++plays;
      stage
         .play((s) => r.show(s))
         .catch((e: unknown) => console.error(e))
         .finally(() => {
            if (plays === id) running = false;
         });
   };

   const build = (s: Stage, half: number, height: number): void => {
      clearTimeout(rebuildTimer);
      rebuildTimer = 0;
      stale = false;
      s.clear();
      cancelOwn();
      clearLater();
      resetVisit();
      running = false;
      plays++;
      const r = createRound(env(s), layoutNow(), half, height);
      round = r;
      art = LOADING;
      void s.ready().then(() => {
         if (dead || round !== r) return;
         art = { status: "ready", data: r };
         if (!announced) {
            announced = true;
            ctx.ready();
         }
         run();
      });
   };
   const env = (s: Stage): Env => ({
      stage: s,
      ring,
      visit,
      clock,
      idleMs: () => clock() - lastInput,
      animate,
      later: (ms, fn) => {
         clearLater();
         later = { fn, left: ms, at: 0, id: 0 };
         arm();
      },
   });

   // A new layout or a much wider or narrower stage: rebuild the cast, once
   // the size has settled, and only while the stage is in view (a change
   // made off screen waits for it to come back).
   let rebuildTimer = 0;
   let stale = false;
   const measure = (): { half: number; height: number } | null => {
      if (!stage) return null;
      const half = stage.half;
      const height = root.clientHeight;
      return half > 0 && height > 0 ? { half, height } : null;
   };
   const rebuild = (): void => {
      const size = measure();
      if (stage && size) build(stage, size.half, size.height);
   };
   const onResize = (): void => {
      const size = measure();
      if (dead || !stage || !size) return;
      if (!round) {
         build(stage, size.half, size.height);
         return;
      }
      const changed =
         layoutNow() !== round.lay ||
         Math.abs(size.half - round.half) >= 12 ||
         Math.abs(size.height - round.height) >= 12;
      if (!changed) return;
      clearTimeout(rebuildTimer);
      if (!visible) {
         stale = true;
         return;
      }
      rebuildTimer = window.setTimeout(rebuild, REBUILD_MS);
   };
   const observer = new ResizeObserver(onResize);
   // The stage's height changes with this query, so the observer sees it.
   const wide = window.matchMedia(WIDE_QUERY);
   const layoutNow = (): Layout => (wide.matches ? WIDE : NARROW);

   void loadTroupe().then((troupe) => {
      if (dead) return;
      const s = troupe.stage(root);
      stage = s;
      s.reduced(reduced);
      if (pausedAt !== null) s.pause();
      // The first size comes from the observer, once layout has settled.
      observer.observe(root);
   });

   const freeze = (): void => {
      if (pausedAt !== null) return;
      pausedAt = performance.now();
      stage?.pause();
      for (const a of own) if (a.playState === "running") a.pause();
      if (later) {
         clearTimeout(later.id);
         later.left = Math.max(0, later.left - (performance.now() - later.at));
      }
      if (rebuildTimer) {
         clearTimeout(rebuildTimer);
         rebuildTimer = 0;
         stale = true;
      }
   };
   const thaw = (): void => {
      if (pausedAt === null) return;
      pausedFor += performance.now() - pausedAt;
      pausedAt = null;
      stage?.resume();
      for (const a of own) if (a.playState === "paused") a.play();
      arm();
   };

   return {
      setReduced: (next) => {
         if (dead || next === reduced) return;
         reduced = next;
         stage?.reduced(next); // turning Reduced on stops the show
         running = false;
         plays++;
         sliding = false;
         resetVisit();
         if (!round) return;
         round.settleTurn();
         if (next) {
            cancelOwn(); // the duck's bounces and squashes
            round.still();
         } else {
            clearLater();
            round.resume();
            run();
         }
      },
      setVisible: (next) => {
         if (dead || next === visible) return;
         visible = next;
         listen(next);
         if (!next) {
            freeze();
            return;
         }
         thaw();
         lastInput = clock(); // coming into view counts as input
         if (stale) rebuild();
         run();
      },
      email: {
         holdStart: (ms) => press("hold", ms),
         holdCancel: cancel,
         copied: () => done("hold"),
         slide: (p) => {
            if (!sliding) {
               sliding = true;
               press("slide", HOLD);
            }
            progress(p);
         },
         slideEnd: (sent) => {
            sliding = false;
            if (sent) done("slide");
            else cancel();
         },
      },
      destroy: () => {
         if (dead) return;
         dead = true;
         observer.disconnect();
         listen(false);
         clearTimeout(rebuildTimer);
         clearLater();
         cancelOwn();
         stage?.destroy();
         stage = null;
         round = null;
         root.remove();
      },
   };
};
