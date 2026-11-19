/* One cast actor: six elements and its moves. Ported from the footer lab's
   cast.js; see index.ts for the layout of the six elements.

   Every motion is a Web Animation of transform or opacity. A move writes its
   end state inline before it starts, so finishing, cancelling or skipping it
   never shows a gap frame. */

import {
   type CastMember,
   type CastMemberId,
   type Pose,
   groundRow,
   MANIFEST,
   stripFor,
} from "./art";
import {
   clamp,
   D,
   FALL,
   frames,
   IO,
   JUMP_SEAT,
   type Key,
   L,
   noop,
   OUT,
   R,
   RISE,
   S,
   seedOf,
   STOPPED,
   T,
   tr,
} from "./motion";
import type { Stage } from "./stage";

/** stand, or seated (sit) or asleep on a seat (sleep). */
export type ActorMode = "stand" | "sit" | "sleep";

/** Placing and posing (instant). */
export interface ActorSet {
   /** CSS px from the stage centre. */
   x?: number;
   /** CSS px above the floor line (a few px up reads as a back row). */
   y?: number;
   /** Frame height = stage.unit x scale. */
   scale?: number;
   z?: number;
   /** Opacity taken off (no filters): 0.1 or so on the back row. */
   dim?: number;
   /** Mirrors the sprite (the frames as drawn face right). */
   flip?: boolean;
   pose?: Pose;
}

export interface ActorOptions extends ActorSet {
   /** Poses not to use for this actor (they fall back, see FALLBACK). */
   avoid?: readonly Pose[];
}

export interface HopOptions {
   /** Where it lands, px above the floor line (default 0, the floor). */
   y?: number;
   hops?: number;
   /** How far the feet clear the surface at the apex. */
   height?: number;
   /** ms in the air per hop. */
   air?: number;
   /** Time multiplier. */
   rate?: number;
   /** Fixed ground speed in px per ms (a stream keeps its spacing). */
   speed?: number;
   /** Land seated on the surface at y. */
   sit?: boolean;
   /** z-index while travelling; its own comes back when it lands. */
   z?: number;
   /** The landing frame (default idle under 0.3h, land above). */
   land?: Pose;
}

export type JumpOptions = Omit<HopOptions, "y" | "hops" | "sit">;

type Part = "root" | "shadow" | "lift" | "squash" | "sprite" | "strip";
// The parts a move animates, in the order every move lists its tracks.
const TRACKED = ["root", "lift", "squash", "shadow"] as const;
type Tracks = Partial<Record<(typeof TRACKED)[number], Key[]>>;

// What a move's build() returns: its length, one track per part, the poses
// ([ms, pose], the last one is where the move ends up), and its end state.
interface Plan {
   ms: number;
   tracks?: Tracks;
   poses?: [number, Pose][];
   start?: () => void;
   z?: number;
   end: () => void;
}

interface Move {
   anims: Animation[];
   end: () => void;
   ended: boolean;
   trip: boolean;
   done: Promise<Actor>;
   res: (a: Actor) => void;
   rej: (e: unknown) => void;
}

// A pose that is missing or avoided falls back along this chain, then to
// idle. Crouch and land are both low poses, so each can stand in for the other.
const FALLBACK: Partial<Record<Pose, Pose[]>> = {
   crouch: ["land"],
   land: ["crouch"],
   sleep: ["sit"],
};

const div = (className: string, ...children: HTMLElement[]): HTMLElement => {
   const el = document.createElement("div");
   el.className = className;
   el.append(...children);
   return el;
};

export class Actor {
   readonly stage: Stage;
   readonly member: CastMember;
   readonly id: CastMemberId;
   /** A fixed number in [0, 1) per actor, for a scene's own jitter. */
   readonly seed: number;
   /** Poses this actor never shows; each falls back along the chain below.
       A move reads the set while it is planned (hopTo and hopTime build
       their pose track before they return), so a scene may add a pose for
       one call and take it out again. */
   readonly avoid: Set<Pose>;
   readonly el: HTMLElement;
   readonly parts: Readonly<Record<Part, HTMLElement>>;
   x = 0;
   y = 0;
   scale = 1;
   z = 10;
   dim = 0;
   flip = false;
   mode: ActorMode = "stand";
   /** The pose showing, or the one a running move ends on. */
   frame: Pose = "idle";
   /** The strip URL this actor uses (set again by stage.ready()). */
   _src: string;
   _shown = false;
   _breath: Animation | null = null;
   private _breathKind: "awake" | "sleep" | null = null;
   private _move: Move | null = null;
   private _gen = 0;
   private readonly _seed2: number;
   private readonly _index: ReadonlyMap<Pose, number>;

   constructor(stage: Stage, member: CastMember, o: ActorOptions) {
      this.stage = stage;
      this.member = member;
      this.id = member.id;
      const order = member.order;
      this._index = new Map(order.map((p, i) => [p, i]));
      this.avoid = new Set(o.avoid ?? []);
      const n = stage.actors.length;
      this.seed = seedOf(`${member.id}:${n}`);
      this._seed2 = seedOf(`${n}:${member.id}`);
      const strip = div("cast-strip");
      const sprite = div("cast-sprite", strip);
      const squash = div("cast-squash", sprite);
      const lift = div("cast-lift", squash);
      const shadow = div("cast-shadow");
      const root = div("cast-actor", shadow, lift);
      root.setAttribute("aria-hidden", "true");
      this.el = root;
      this.parts = { root, shadow, lift, squash, sprite, strip };
      root.style.opacity = "0"; // shown by stage.ready()
      root.style.setProperty("--n", String(order.length));
      stage.el.append(root);
      this.set({ ...o, pose: o.pose ?? "idle" });
      this._src = stripFor(member, this.h);
   }
   /** Frame height in CSS px. */
   /** True while a trip (hopTo or moveTo) is under way: a jump started now
       would cut it short. */
   get travelling(): boolean {
      return this._move?.trip ?? false;
   }

   get h(): number {
      return Math.round(this.stage.unit * this.scale);
   }
   /** Frame width in CSS px. */
   get w(): number {
      return Math.round((this.h * MANIFEST.size[0]) / MANIFEST.size[1]);
   }
   /** The frame row that touches the surface, as a fraction of height: the
       feet when standing, the ledge row when seated. The jump frame is drawn
       in mid-air, with its feet above its registered ground row, so it
       touches down with its own feet (its bottom row): take-off and landing
       meet the floor without a step. */
   ground(pose: Pose): number {
      return groundRow(this.member, this._resolve(pose));
   }
   private _resolve(name: Pose): Pose {
      const ok = (p: Pose): boolean => this._index.has(p) && !this.avoid.has(p);
      if (ok(name)) return name;
      for (const alt of FALLBACK[name] ?? []) if (ok(alt)) return alt;
      return "idle";
   }
   // The strip offset that shows pose p with its ground row on the anchor,
   // in whole px so a frame never lands on a half pixel (a blurrier
   // resample that can also differ between two rasters of the same still).
   private _stripAt(p: Pose): string {
      const i = this._index.get(p) ?? 0;
      return `translate(${-i * this.w}px, ${Math.round(this.h * (1 - this.ground(p)))}px)`;
   }
   // Swaps the frame only; moves animate the same transform in steps.
   private _frame(name: Pose): void {
      const p = this._resolve(name);
      this.parts.strip.style.transform = this._stripAt(p);
      this.frame = p;
   }
   /** Frame swap now; sit and sleep set the mode and hide the shadow. */
   pose(name: Pose): this {
      this._frame(name);
      this.mode = name === "sit" || name === "sleep" ? name : "stand";
      this.parts.shadow.style.opacity = this.mode === "stand" ? "" : "0";
      this._breathe();
      return this;
   }
   /** Places and poses at once; ends any move first. */
   set(o: ActorSet = {}): this {
      this._gen++; // drops gestures queued behind a trip
      this._interrupt();
      if (o.x != null) this.x = o.x;
      if (o.y != null) this.y = o.y;
      if (o.scale != null) this.scale = o.scale;
      if (o.z != null) this.z = o.z;
      if (o.dim != null) this.dim = o.dim;
      if (o.flip != null) this.flip = o.flip;
      const s = this.parts.sprite.style;
      s.setProperty("--flip", this.flip ? "-1" : "1");
      s.setProperty("--dim", String(this.dim));
      this._size();
      this._place();
      if (o.pose) this.pose(o.pose);
      return this;
   }
   /** Takes the actor off the stage. */
   remove(): void {
      this._gen++;
      this._interrupt();
      this._breath?.cancel();
      this._breath = null;
      this.el.remove();
      this.stage.actors = this.stage.actors.filter((a) => a !== this);
   }
   _size(): void {
      this.parts.root.style.setProperty("--h", `${this.h}px`);
      this.parts.root.style.setProperty("--w", `${this.w}px`);
      this._frame(this.frame); // the strip offset is in px of this size
   }
   private _place(): void {
      const s = this.parts.root.style;
      s.transform = tr(this.x, this.y);
      s.zIndex = String(this.z);
   }
   private _at(x: number, y: number): void {
      this.x = x;
      this.y = y;
      this._place();
   }
   // Idle life: 1 to 2 percent of height from the ground point, 3 to 4 s,
   // its own phase. Asleep: slower and deeper, and the chest widens a bit.
   // It runs on the sprite, which no move animates, so it never pops when a
   // move starts or ends and it carries on underneath every move.
   _breathe(): void {
      const kind = this.mode === "sleep" ? "sleep" : "awake";
      if (this._breath && this._breathKind === kind) return;
      this._breath?.cancel();
      this._breath = null;
      this._breathKind = kind;
      if (!this._shown || this.stage.reduced()) return;
      const [ms, ax, ay] =
         kind === "sleep"
            ? [4800, 0.008, 0.024]
            : [3000 + this.seed * 1000, 0, 0.01 + this._seed2 * 0.008];
      const k = [
         S(0, 1, 1, 0, "ease-in-out"),
         S(0.5, 1 + ax, 1 + ay, 0, "ease-in-out"),
         S(1, 1, 1),
      ];
      this._breath = this.stage._animate(this.parts.sprite, frames(k, 1), ms, {
         iterations: Infinity,
         delay: -this._seed2 * ms,
      });
   }

   /* ---- moves: each returns a promise that resolves when it ends ---- */

   // build() runs after the previous move is wrapped up, so it plans from
   // where the actor really is. In Reduced only end() runs.
   // trip: hopTo and moveTo. A move that is not a trip, started while a trip
   // runs, waits for the trip to land instead of cutting it short.
   private _run(
      build: () => Plan,
      trip = false,
      across = trip,
   ): Promise<Actor> {
      const running = this._move;
      if (!trip && running?.trip) {
         const gen = this._gen;
         const later = running.done.then(() =>
            gen === this._gen ? this._run(build, trip, across) : this,
         );
         later.catch(noop);
         return later;
      }
      this._interrupt();
      const st = this.stage;
      const plan = build();
      if (st.reduced() || !(plan.ms > 0)) {
         plan.end();
         return Promise.resolve(this);
      }
      let res: (a: Actor) => void = noop;
      let rej: (e: unknown) => void = noop;
      const done = new Promise<Actor>((y, n) => {
         res = y;
         rej = n;
      });
      done.catch(noop); // a move nobody awaits must not report a stop as an error
      const move: Move = {
         anims: [],
         end: plan.end,
         ended: false,
         trip,
         done,
         res,
         rej,
      };
      this._move = move;
      try {
         if (across) this.parts.root.style.willChange = "transform";
         if (plan.z != null) this.parts.root.style.zIndex = String(plan.z);
         const poses = plan.poses ?? [];
         const strip = this._poseTrack(poses, plan.ms);
         const last = poses.at(-1);
         if (last) this._frame(last[1]); // the end frame, inline
         if (strip)
            move.anims.push(st._animate(this.parts.strip, strip, plan.ms));
         for (const part of TRACKED) {
            const track = plan.tracks?.[part];
            if (!track) continue;
            const k = frames(track, plan.ms);
            const el = this.parts[part];
            move.anims.push(st._animate(el, k, plan.ms));
            // the end state, inline, before it starts
            const end = track.at(-1);
            if (end) {
               el.style.transform = end.transform;
               if (end.opacity !== undefined)
                  el.style.opacity = String(end.opacity);
            }
         }
         plan.start?.();
      } catch (e) {
         this._end(move, false);
         throw e;
      }
      // The move ends on its own animation clock, so pause and resume need
      // nothing extra and a busy main thread only delays the bookkeeping.
      const first = move.anims[0];
      if (first) first.finished.then(() => this._end(move, false), noop);
      else st._after(plan.ms, () => this._end(move, false));
      return move.done;
   }
   // Pose changes as a stepped transform track on the strip: each frame
   // shows from its own time to the next one's, on the compositor.
   private _poseTrack(poses: [number, Pose][], ms: number): Keyframe[] | null {
      if (!poses.length) return null;
      const list: [number, Pose][] = poses.map(([at, p]) => [
         at,
         this._resolve(p),
      ]);
      const head = list[0];
      if (head && head[0] > 0) list.unshift([0, this.frame]);
      if (list.every(([, p]) => p === list[0]?.[1])) return null;
      return frames(
         list.map(([at, p]) => ({
            at,
            transform: this._stripAt(p),
            easing: "step-end",
         })),
         ms,
      );
   }
   private _end(move: Move, stopped: boolean): void {
      if (move.ended) return;
      move.ended = true;
      for (const a of move.anims) a.cancel();
      if (this._move === move) this._move = null;
      this.parts.root.style.willChange = "";
      move.end();
      this._place(); // also gives back the z-index a trip may have lowered
      if (stopped) move.rej(STOPPED);
      else move.res(this);
   }
   // Ends at the end state and resolves.
   private _interrupt(): void {
      if (this._move) this._end(this._move, false);
   }
   /** The same as an interrupt, but rejects with STOPPED (stage.stop). */
   _halt(): void {
      if (this._move) this._end(this._move, true);
   }

   /** Crouch, parabola, land squash, the standing frame springs up. Long
       trips split into hops of about one body height. */
   hopTo(x: number, o: HopOptions = {}): Promise<Actor> {
      return this._run(() => this._hop(x, o), true);
   }
   /** How long hopTo(x, o) would take from where the actor is now, in ms. */
   hopTime(x: number, o: HopOptions = {}): number {
      return this.stage.reduced() ? 0 : this._hop(x, o).ms;
   }
   /** In place. Seated, it takes off from the seat and lands back on it. */
   jump({
      height = this.h * 0.5,
      air = 460,
      ...o
   }: JumpOptions = {}): Promise<Actor> {
      return this.hopTo(this.x, {
         ...o,
         y: this.y,
         hops: 1,
         height,
         air,
         sit: this.mode !== "stand",
      });
   }
   private _hop(x1: number, o: HopOptions): Plan {
      const H = this.h;
      const r = o.rate ?? 1;
      const { x: x0, y: y0 } = this;
      const y1 = o.y ?? 0;
      const fromSeat = this.mode !== "stand";
      const toSeat = !!o.sit;
      // From the jump frame's anchor (its feet) up to its tucked thighs.
      const drop = (this.ground("jump") - JUMP_SEAT) * H;
      const ys = fromSeat ? y0 - drop : y0;
      const ye = toSeat ? y1 - drop : y1;
      const mid = Math.min(y0, y1); // contacts in a chain land on the lower surface
      const dx = x1 - x0;
      // Long trips split into hops of at most about one body height.
      const n = Math.max(
         1,
         Math.round(o.hops ?? Math.ceil(Math.abs(dx) / (1.1 * H))),
      );
      const step = Math.abs(dx) / n;
      // height: how far the feet clear the surface at the apex.
      const h = o.height ?? clamp(0.26 * H + 0.2 * step, 0.24 * H, 0.6 * H);
      const c = T.crouch / r;
      const g = T.touch / r;
      // speed (px per ms) fixes the ground speed, so a stream of hoppers
      // keeps its spacing whatever each one's hop length is.
      const air = Math.max(
         1,
         o.speed
            ? Math.max(260, step / o.speed - g)
            : (o.air ?? clamp(300 + 0.6 * step + 0.5 * h, 300, 540)) / r,
      );
      const k1 = Math.min(50 / r, air * 0.25);
      const k2 = Math.min(40 / r, air * 0.2);
      const low: Pose = fromSeat ? "sit" : "crouch";
      // A small hop lands light, straight onto the standing frame (the jump
      // frame is about as tall, so the swap barely moves the head; crouch
      // or land would drop it by a third of the body). A big one lands on
      // the land frame.
      const landAs = this._resolve(o.land ?? (h < 0.3 * H ? "idle" : "land"));
      // No low frame for this member: a deeper squash does the anticipation.
      const deep = this._resolve(low) === "idle" ? 1.4 : 1;
      const root = [R(0, x0, y0)];
      const lift = [L(0, 0)];
      const squash = [
         S(0, 1, 1, 0, OUT),
         S(c, 1 + 0.05 * deep, 1 - 0.06 * deep),
      ];
      const shadow = [D(0, 1, fromSeat ? 0 : 1)];
      const poses: [number, Pose][] = [[0, low]];
      let t = c;
      for (let i = 0; i < n; i++) {
         const xa = x0 + (dx * i) / n;
         const xb = x0 + (dx * (i + 1)) / n;
         const ya = i === 0 ? ys : mid;
         const yb = i === n - 1 ? ye : mid;
         const t1 = t + air;
         const tm = t + air / 2;
         poses.push([t, "jump"]);
         root.push(R(t, xa, i === 0 ? y0 : ya));
         if (i === 0 && fromSeat) root.push(R(t + 0.5, xa, ya)); // seat row to the jump frame's thighs
         root.push(R(t1, xb, yb)); // linear: constant speed across
         lift.push(L(t, 0, RISE), L(tm, h, FALL), L(t1, 0));
         // stretch out of the take-off, round at the apex, reach for the floor
         squash.push(
            S(t + k1, 0.95, 1.06, 0, IO),
            S(tm, 1, 1, 0, IO),
            S(t1 - k2, 0.97, 1.04),
            S(t1, 1, 1, 0, OUT),
         );
         shadow.push(D(t, 1.04, 1, RISE), D(tm, 0.55, 0.35, FALL), D(t1, 1, 1));
         t = t1;
         if (i < n - 1) {
            // touch and go: the contact frame is the next hop's anticipation
            poses.push([t, "crouch"]);
            squash.push(S(t + g * 0.6, 1.06, 0.94));
            root.push(R(t + g, xb, yb));
            lift.push(L(t + g, 0));
            shadow.push(D(t + g, 1.04, 1));
            t += g;
         }
      }
      let final: Pose = "idle";
      if (toSeat) {
         // The thighs meet the ledge: swap to sit and move the anchor to the seat row.
         const e = t + T.seat / r;
         final = "sit";
         poses.push([t, "sit"], [e, "sit"]);
         root.push(R(t + 0.5, x1, y1));
         squash.push(S(t + 70 / r, 1.05, 0.95, 0, IO), S(e, 1, 1));
         shadow.push(D(t + 0.5, 1, 0), D(e, 1, 0));
         t = e;
      } else if (landAs === "idle") {
         // no low frame: the standing frame takes the whole landing squash
         const e = t + (T.squash + T.settle) / r;
         poses.push([t, "idle"], [e, "idle"]);
         squash.push(S(t + T.squash / r, 1.07, 0.93, 0, IO), S(e, 1, 1));
         shadow.push(D(t + T.squash / r, 1.08, 1), D(e, 1, 1));
         t = e;
      } else {
         // land: squash 7 percent, settle to 3, then the standing frame
         // springs up out of it (a small stretch that eases back to 1)
         const a = t + T.squash / r;
         const b = a + T.settle / r;
         const e = b + T.rise / r;
         poses.push([t, landAs], [b, "idle"], [e, "idle"]);
         squash.push(
            S(a, 1.07, 0.93, 0, IO),
            S(b, 1.03, 0.96),
            S(b, 0.97, 1.04, 0, OUT),
            S(e, 1, 1),
         );
         shadow.push(D(a, 1.08, 1), D(e, 1, 1));
         t = e;
      }
      root.push(R(t, x1, y1));
      lift.push(L(t, 0));
      const end = (): void => {
         this._at(x1, y1);
         this.pose(final);
      };
      return {
         ms: t,
         tracks: { root, lift, squash, shadow },
         poses,
         z: o.z,
         end,
      };
   }
   /** Wave frame, a pop, the body rocks on its feet; back to idle. Seated,
       only the rock. */
   wave(ms = 1200): Promise<Actor> {
      return this._run(() => {
         ms = Math.max(ms, 500);
         const seated = this.mode !== "stand";
         const back: Pose = this.mode === "stand" ? "idle" : this.mode;
         // a pop as the hand comes up, then the body rocks on its feet
         const sq = [S(0, 1, 1, 0, OUT), S(130, 0.97, 1.03, 0, IO)];
         let deg = this.flip ? 1.4 : -1.4;
         for (let t = 300; t < ms - 220; t += 380, deg *= -0.8)
            sq.push(S(t, 1, 1, deg, IO));
         sq.push(S(ms, 1, 1));
         return {
            ms,
            tracks: { squash: sq },
            poses: seated
               ? []
               : [
                    [0, "wave"],
                    [ms, back],
                 ],
            end: () => this.pose(back),
         };
      });
   }
   /** Him only (crowd frames have no wink: they get idle with the same
       tilt). */
   wink(ms = 900): Promise<Actor> {
      return this._run(() => ({
         ms,
         tracks: {
            squash: [
               S(0, 1, 1, 0, OUT),
               S(140, 1.02, 0.98, 1.2, IO),
               S(ms - 160, 1, 1, 1.2, IO),
               S(ms, 1, 1),
            ],
         },
         poses: [
            [0, "wink"],
            [ms, "idle"],
         ],
         end: () => this.pose("idle"),
      }));
   }
   /** Sits down where the actor stands: put it on a ledge first (hopTo with
       y), or hop straight into the seat with hopTo(x, { y, sit: true }). */
   sit(): Promise<Actor> {
      return this._run(() => {
         if (this.mode !== "stand")
            return { ms: 0, end: () => this.pose("sit") };
         const H = this.h;
         return {
            ms: 360,
            tracks: {
               lift: [L(0, 0.2 * H, FALL), L(170, 0), L(360, 0)], // drops into the seat
               squash: [
                  S(0, 1, 1),
                  S(170, 1, 1, 0, OUT),
                  S(240, 1.05, 0.95, 0, IO),
                  S(360, 1, 1),
               ],
               shadow: [D(0, 1, 1), D(170, 0.8, 0), D(360, 0.8, 0)],
            },
            poses: [[0, "sit"]],
            end: () => this.pose("sit"),
         };
      });
   }
   /** Stands up on the surface it sits on. */
   stand(): Promise<Actor> {
      return this._run(() => {
         if (this.mode === "stand") return { ms: 0, end: noop };
         const H = this.h;
         return {
            ms: 330,
            tracks: {
               lift: [L(0, -0.16 * H, OUT), L(220, 0), L(330, 0)], // rises out of the seat
               squash: [S(0, 0.97, 1.03, 0, OUT), S(330, 1, 1)],
               shadow: [D(0, 0.8, 0), D(220, 1, 1), D(330, 1, 1)],
            },
            poses: [[0, "idle"]],
            end: () => this.pose("idle"),
         };
      });
   }
   /** Seated actors only: a slow slump into the sleep frame. */
   sleep(): Promise<Actor> {
      return this._run(() => ({
         ms: 1000,
         tracks: {
            squash: [
               S(0, 1, 1.015, 0, IO),
               S(450, 1.01, 0.975, 0, IO),
               S(1000, 1, 1),
            ],
         },
         poses: [[0, "sleep"]],
         end: () => this.pose("sleep"),
      }));
   }
   /** Seated actors only: a startled little jump off the seat, back down
       awake. */
   wake(): Promise<Actor> {
      return this._run(() => ({
         ms: 440,
         tracks: {
            lift: [
               L(0, 0, RISE),
               L(110, 0.09 * this.h, FALL),
               L(260, 0),
               L(440, 0),
            ],
            squash: [
               S(0, 1, 1, 0, OUT),
               S(60, 0.95, 1.06, -1.5, IO),
               S(170, 1, 1, 1, IO),
               S(260, 1, 1, 0, OUT),
               S(320, 1.05, 0.95, 0, IO),
               S(440, 1, 1),
            ],
         },
         poses: [[0, "sit"]],
         end: () => this.pose("sit"),
      }));
   }
   /** The frames as drawn count as facing right; "left" mirrors the
       sprite. */
   face(dir: "left" | "right"): Promise<Actor> {
      const flip = dir === "left";
      const apply = (): void => {
         this.flip = flip;
         this.parts.sprite.style.setProperty("--flip", flip ? "-1" : "1");
      };
      return this._run(() =>
         flip === this.flip
            ? { ms: 0, end: noop }
            : {
                 ms: 180,
                 tracks: { squash: [S(0, 0.9, 1.01, 0, OUT), S(180, 1, 1)] },
                 start: apply,
                 end: apply,
              },
      );
   }
   /** A weight shift: over by dx with a lean, and back. */
   nudge(dx: number, ms = 700): Promise<Actor> {
      return this._run(
         () => {
            const { x, y } = this;
            const m = ms * 0.45;
            const root = [R(0, x, y, IO), R(m, x + dx, y, IO), R(ms, x, y)];
            return {
               ms,
               tracks: {
                  root,
                  squash: [
                     S(0, 1, 1, 0, IO),
                     S(m, 1, 1, Math.sign(dx) * 1.2, IO),
                     S(ms, 1, 1),
                  ],
               },
               end: noop,
            };
         },
         false,
         true,
      );
   }
   /** Slides without a hop (depth passes, crowd drift). */
   moveTo(x: number, y?: number, ms = 600): Promise<Actor> {
      return this._run(() => {
         const y1 = y ?? this.y;
         return {
            ms,
            tracks: { root: [R(0, this.x, this.y, IO), R(ms, x, y1)] },
            end: () => this._at(x, y1),
         };
      }, true);
   }
}
