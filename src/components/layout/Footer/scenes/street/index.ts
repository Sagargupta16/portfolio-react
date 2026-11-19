/* Footer scene "Rush hour", ported from the footer lab's draft S, "Rush
   Hour, Paused" (rush-hour-night/street.js; its controls.js became the
   email events at the bottom of this file).

   The street plays a score: every walker steps on one shared beat, groups
   enter from both edges staggered by depth, and once a loop a passer-by
   waves at him and he waves back. The speed of the score is the scroll speed
   of the visitor (it rewinds on scroll up), with the near lane answering
   first and the far lane last. When the scroll rests, or the visitor simply
   arrives and stops, the street glides to a composed stop (nobody in his
   frame) and he alone moves. Left alone the street empties, he sits on the
   rail and later dozes. Reduced is the composed still: the wave, frozen.

   Three files move together: score.ts decides what the walkers do,
   people.ts draws them, this file plays both. scenery.ts builds what stands
   still.

   Nothing here animates on the main thread at the display rate: walkers are
   stepped strips and transforms on HTML elements, tone changes are stepped
   transitions of registered custom properties, and the rate changes about
   15 times a second. */

import art1280 from "@assets/footer/scenes/street-1280.avif";
import art2560 from "@assets/footer/scenes/street-2560.avif";
import { EASING } from "@/constants/theme";
import { memberFrames, type MemberFrames } from "../cast/art";
import type {
   FooterSceneContext,
   FooterSceneEmailEvents,
   FooterSceneMount,
} from "../types";
import { strip, type Strip } from "./people";
import { buildScenery, type MePose } from "./scenery";
import {
   ART,
   clashes,
   clipped,
   laneAt,
   type LaneId,
   type Layout,
   layoutFor,
   mod,
   plan,
   type Planned,
} from "./score";
import "./street.css";

// the depth ripple: how many rate ticks each lane answers after the near lane
const LAG: Record<LaneId, number> = { near: 0, mid: 1, road: 2, far: 3 };
/** ms between rate changes: about 15 a second at most. */
const TICK_MS = 66;
/** s of score before the still where motion starts. */
const LEAD = 0.9;
/** She raises her hand this long before the beat, */
const WAVE_PRE = 0.7;
/** and lowers it this long after. */
const WAVE_POST = 1.1;
/** How long the street stays frozen. */
const FREEZE_MS = 3500;
/** The street must have run this long since the last freeze began. */
const FREEZE_GAP_MS = 8000;
/** At rest this long, in view, before a freeze. */
const REST_MS = 250;
/** Without input this long, rush hour ends. */
const IDLE_MS = 20000;
/** Sitting this long, he dozes. */
const DOZE_MS = 8000;
/** A press on the email control that never reports back lets go by itself. */
const PRESS_GRACE_MS = 800;
/** A new size must hold this long: a passing size is not a new layout. */
const SETTLE_MS = 300;
const OUT = `cubic-bezier(${EASING.cinematic.join(", ")})`;
const IN_OUT = "cubic-bezier(0.45, 0, 0.55, 1)";

type Mode = "run" | "freeze" | "resume" | "empty" | "sitting" | "asleep";
/** A walker on the street, waiting off stage for its next pass, or gone
    home (rush hour over). */
type Where = "street" | "wings" | "gone";
/** How a pose arrives. */
type How = "sit" | "fade" | "stand" | "squash";

interface Clocked {
   an: Animation;
   /** s it runs ahead of the score. */
   phase: number;
}

interface Walker extends Planned<Strip> {
   el: HTMLElement;
   poseEl: HTMLElement;
   strips: HTMLElement[];
   anims: Clocked[];
   where: Where;
   smear: number;
}

/** What the email control is doing to the street. */
type Hold =
   { by: "press"; t0: number; ms: number } | { by: "slide"; progress: number };

interface Timer {
   fn: () => void;
   left: number;
   at: number;
   id: number;
}

/* Timeouts that hold while the scene is hidden and carry on after. */
const createClock = () => {
   const timers = new Set<Timer>();
   let held = false;
   const arm = (t: Timer): void => {
      t.at = performance.now();
      t.id = window.setTimeout(() => {
         timers.delete(t);
         t.fn();
      }, t.left);
   };
   return {
      after(ms: number, fn: () => void): Timer {
         const t: Timer = { fn, left: Math.max(0, ms), at: 0, id: 0 };
         timers.add(t);
         if (!held) arm(t);
         return t;
      },
      cancel(t: Timer | null): void {
         if (!t) return;
         window.clearTimeout(t.id);
         timers.delete(t);
      },
      hold(): void {
         if (held) return;
         held = true;
         const now = performance.now();
         for (const t of timers) {
            window.clearTimeout(t.id);
            t.left = Math.max(0, t.left - (now - t.at));
         }
      },
      release(): void {
         if (!held) return;
         held = false;
         for (const t of timers) arm(t);
      },
      clear(): void {
         for (const t of timers) window.clearTimeout(t.id);
         timers.clear();
      },
   };
};

const el = (className: string): HTMLDivElement => {
   const node = document.createElement("div");
   node.className = className;
   return node;
};
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const q4 = (r: number): number =>
   Math.max(-3, Math.min(3, Math.round(r * 4) / 4));

interface ShowOptions {
   root: HTMLElement;
   street: HTMLElement;
   hit: HTMLElement;
   L: Layout;
   W: number;
   frames: MemberFrames;
   ctx: FooterSceneContext<"street">;
   reduced: boolean;
   /** The first build of this mount: his entrance plays and the arrival
       counts. A rebuild after a resize is neither. */
   first: boolean;
   /** The stamp of the Reduced still. */
   loadTime: Date;
}

interface Show {
   setVisible(visible: boolean): void;
   setReduced(reduced: boolean): void;
   /** Hover or tap on him. */
   wave(): void;
   email: Required<FooterSceneEmailEvents>;
   destroy(): void;
}

/* One layout of the street, built and played. A new size gets a new show. */
function createShow(o: ShowOptions): Show {
   const { root, street, L, W, ctx } = o;
   const LOOP = L.L * 1000;
   // a shared clock origin far from 0, so rewinding never ends
   const T0 = Math.ceil(1e7 / LOOP) * LOOP;
   const c = W / 2;

   /* ---------- build ---------- */
   const sc = buildScenery(street, L, W, o.frames);
   Object.assign(o.hit.style, {
      left: `${sc.hit.left.toFixed(1)}px`,
      top: `${sc.hit.top}px`,
      width: `${sc.hit.width.toFixed(1)}px`,
      height: `${sc.hit.height}px`,
   });
   // the crowd, timed by the score
   const actors: Walker[] = plan(L, W, strip).map((a) => {
      const walker = el("st-w");
      walker.style.top = `${a.ground}px`;
      const poseEl = el("st-pose");
      const vp = el("st-vp");
      Object.assign(vp.style, {
         width: `${a.st.fw}px`,
         height: `${a.st.fh}px`,
         left: `${-a.st.hipX}px`,
         top: `${-a.st.groundY}px`,
      });
      const strips = [a.st, a.st2].flatMap((s, k) => {
         if (!s) return [];
         const box = el(k ? "st-strip st-strip-wave" : "st-strip");
         box.append(s.svg);
         return [box];
      });
      vp.append(...strips);
      poseEl.append(vp);
      walker.append(poseEl);
      sc.lanes[a.lane].append(walker);
      return {
         ...a,
         el: walker,
         poseEl,
         strips,
         anims: [],
         where: "street",
         smear: -1,
      };
   });
   const waveActor = actors.find((a) => a.wave) ?? null;

   /* ---------- time helpers ---------- */
   // where a walker is at score time t (s), and whether it is on the street
   const at = (a: Walker, t: number) => laneAt(L, a, t);
   const inWave = (t: number): boolean => {
      const d = mod(t - L.still, L.L);
      return d <= WAVE_POST || d >= L.L - WAVE_PRE;
   };

   // Static transforms for score time t: the composed still.
   function placeStill(t: number): void {
      for (const a of actors) {
         const { x, y, on } = at(a, t);
         a.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
         a.el.style.visibility = on ? "" : "hidden";
         const N = a.st.frames;
         const f = Math.floor((mod(t + a.phase, a.cycle) / a.cycle) * N);
         for (const s of a.strips)
            s.style.transform = `translateX(${-f * a.st.fw}px)`;
         const [plain, raised] = a.strips;
         if (plain && raised) {
            const w = inWave(t);
            plain.style.opacity = w ? "0" : "1";
            raised.style.opacity = w ? "1" : "0";
         }
         a.poseEl.style.transform = `scaleX(${a.dir})`;
      }
   }
   // The time of the Reduced still: the composed moment, or on a narrow
   // stage (where the far walkers stand closer to him) the nearest 50 ms
   // step either side of it with nobody in his frame, as a freeze looks
   function stillTime(): number {
      const hits = (t: number): number =>
         actors.filter((a) => clashes(L, a, t, c)).length;
      let best = { t: L.still, hit: hits(L.still) };
      for (let k = 1; k <= 10 && best.hit; k++)
         for (const t of [L.still + k * 0.05, L.still - k * 0.05]) {
            const hit = hits(t);
            if (hit < best.hit) best = { t, hit };
            if (!hit) break;
         }
      return best.t;
   }

   /* ---------- state ---------- */
   let reduced = o.reduced;
   let visible = false;
   let dead = false;
   /** The walkers have their animations (Full motion). */
   let running = false;
   let mode: Mode = "run";
   const is = (...modes: Mode[]): boolean => modes.includes(mode);
   /** The scroll-driven rate, quantised to 0.25. */
   let master = 1;
   /** The master rate over the last ticks, newest first. */
   const history = [1, 1, 1, 1];
   let ticker = 0;
   let lastTick = 0;
   let vel = 0;
   const acc = { scroll: 0, input: 0 };
   let lastY = window.scrollY;
   let lastMove = -1e9;
   let lastInput = performance.now();
   let lastResize = -1e9;
   let lastFreeze = -1e9;
   /** A rest may freeze the street (once per rest). */
   let armed = false;
   /** Half of the scene or more is in view. */
   let half = false;
   let wasOut = o.first;
   let hold: Hold | null = null;
   let rampAt = 0;
   let freezeMoved = 0;
   let lastScore: number | null = null;
   let entered = !o.first;
   let cur: MePose | null = null;
   let breathAnim: Animation | null = null;
   let leanAnim: Animation | null = null;
   let waveBackT: Timer | null = null;
   let waveT: Timer | null = null;
   /** The freeze, the doze and the wake: cleared together. */
   const beats = createClock();
   /** His answers to a wave. */
   const asides = createClock();

   /* One-shot animations (a pose arriving, the brackets): held while the
      scene is hidden, like the timers. */
   const shots = new Set<Animation>();
   let heldShots: Animation[] = [];
   /** The delayed fade-ins of the brackets and the stamp of a freeze. */
   let snapIns: Animation[] = [];
   const shot = (
      target: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
   ): Animation => {
      const an = target.animate(keyframes, options);
      shots.add(an);
      const drop = (): void => {
         shots.delete(an);
      };
      an.addEventListener("finish", drop);
      an.addEventListener("cancel", drop);
      if (!visible) {
         an.pause();
         heldShots.push(an);
      }
      return an;
   };

   // The lights of the painting hold while hidden and in a freeze (the
   // photo); Reduced shows them as a still.
   const lights = (): void => {
      root.classList.toggle("st-hush", !visible || mode === "freeze");
      root.classList.toggle("st-still", reduced);
   };
   const setMode = (next: Mode): void => {
      mode = next;
      // for checks; nothing reads it in production
      root.dataset.mode = next;
      lights();
   };

   /* ---------- his poses ---------- */
   function showPose(name: MePose, how?: How): void {
      const next = sc.cuts[name];
      const prev = cur ? sc.cuts[cur] : undefined;
      if (!next || prev === next) return;
      for (const [key, cut] of Object.entries(sc.cuts))
         cut.classList.toggle("st-on", key === name);
      cur = name;
      if (!how || reduced) return;
      // sitting down and standing up: one 360 ms crossfade, the sitting cut
      // travelling from his standing hip height to the rail
      const drop = sc.hipDrop.toFixed(1);
      if (how === "sit") {
         shot(
            next,
            [
               { opacity: 0, transform: `translateY(${drop}px)` },
               { opacity: 1, transform: "none" },
            ],
            { duration: 360, easing: OUT },
         );
         if (prev)
            shot(prev, [{ opacity: 1 }, { opacity: 0 }], {
               duration: 360,
               easing: OUT,
            });
      } else if (how === "fade") {
         shot(next, [{ opacity: 0 }, { opacity: 1 }], {
            duration: 700,
            easing: "ease-in-out",
         });
         if (prev)
            shot(prev, [{ opacity: 1 }, { opacity: 0 }], {
               duration: 700,
               easing: "ease-in-out",
            });
      } else if (how === "stand") {
         shot(
            next,
            [
               { opacity: 0, transform: `translateY(-${drop}px)` },
               { opacity: 1, transform: "none" },
            ],
            { duration: 360, easing: OUT },
         );
         if (prev)
            shot(prev, [{ opacity: 1 }, { opacity: 0 }], {
               duration: 360,
               easing: OUT,
            });
      } else {
         shot(
            sc.me.pose,
            [
               {
                  transform: "scale(1, 1)",
                  easing: "cubic-bezier(0.2, 0, 0.4, 1)",
               },
               {
                  transform: "scale(1.025, 0.97)",
                  offset: 0.35,
                  easing: "cubic-bezier(0.3, 0, 0.2, 1)",
               },
               {
                  transform: "scale(0.99, 1.015)",
                  offset: 0.7,
                  easing: "cubic-bezier(0.3, 0, 0.3, 1)",
               },
               { transform: "scale(1, 1)" },
            ],
            { duration: 300 },
         );
      }
   }

   /* ---------- the clock of the score ---------- */
   // Every walker's animations share one clock: T0 + score time.
   function setActorClock(a: Walker, t: number): void {
      for (const { an, phase } of a.anims)
         an.currentTime = T0 + (t + phase) * 1000;
   }
   function setClock(t: number): void {
      for (const a of actors) setActorClock(a, t);
   }
   // score time as one walker's own clock sees it (they all share it, but a
   // walker that has gone home is paused, so each one reads its own)
   const tOf = (a: Walker | undefined): number => {
      const lane = a?.anims[0];
      return lane
         ? mod((Number(lane.an.currentTime ?? 0) - T0) / 1000, L.L)
         : 0;
   };
   const scoreTime = (): number => tOf(waveActor ?? actors[0]);

   // One pass per loop as keyframes: linear between waypoints, a hidden hold
   // while off stage, and a step back to the start when the next pass begins.
   function laneKeys(a: Walker): Keyframe[] {
      const T = L.L;
      const eps = 1e-4;
      const tE = mod(a.enter, T);
      const ts = [...new Set([0, ...a.path.map((p) => mod(a.enter + p.t, T))])]
         .filter((t) => t < T)
         .sort((x, y) => x - y);
      const tr = (q: { x: number; y: number }): string =>
         `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
      const keys: Keyframe[] = [];
      for (const t of ts) {
         if (t === tE && t > eps)
            keys.push({
               offset: (t - eps) / T,
               transform: tr(at(a, t - eps)),
               easing: "step-end",
            });
         keys.push({
            offset: t / T,
            transform: tr(at(a, t)),
            easing: "linear",
         });
      }
      keys.push({ offset: 1, transform: tr(at(a, T - eps)) });
      return keys;
   }
   // her raised hand, timed by the score: shown around the beat
   function waveKeys(raised: boolean): Keyframe[] {
      const on = mod(L.still - WAVE_PRE, L.L) / L.L;
      const off = mod(L.still + WAVE_POST, L.L) / L.L;
      const v = (show: boolean): number => (show === raised ? 1 : 0);
      const keys: Keyframe[] =
         on < off
            ? [
                 { offset: 0, opacity: v(false), easing: "step-end" },
                 { offset: on, opacity: v(true), easing: "step-end" },
                 { offset: off, opacity: v(false), easing: "step-end" },
              ]
            : [
                 { offset: 0, opacity: v(true), easing: "step-end" },
                 { offset: off, opacity: v(false), easing: "step-end" },
                 { offset: on, opacity: v(true), easing: "step-end" },
              ];
      keys.push({ offset: 1, opacity: keys[0]?.opacity ?? 0 });
      return keys;
   }
   function createAnims(): void {
      for (const a of actors) {
         const lane = a.el.animate(laneKeys(a), {
            duration: LOOP,
            iterations: Infinity,
         });
         a.anims = [{ an: lane, phase: 0 }];
         const N = a.st.frames;
         for (const s of a.strips)
            a.anims.push({
               an: s.animate(
                  [
                     { transform: "translateX(0px)" },
                     { transform: `translateX(${-N * a.st.fw}px)` },
                  ],
                  {
                     duration: a.cycle * 1000,
                     iterations: Infinity,
                     easing: `steps(${N})`,
                  },
               ),
               phase: a.phase,
            });
         const [plain, raised] = a.strips;
         if (plain && raised)
            a.anims.push(
               {
                  an: plain.animate(waveKeys(false), {
                     duration: LOOP,
                     iterations: Infinity,
                  }),
                  phase: 0,
               },
               {
                  an: raised.animate(waveKeys(true), {
                     duration: LOOP,
                     iterations: Infinity,
                  }),
                  phase: 0,
               },
            );
         for (const { an } of a.anims) an.pause();
      }
      // motion starts a beat before the still, so the scroll that brings a
      // visitor here carries the street into its composed moment
      setClock(L.still - LEAD);
      for (const a of actors) a.el.style.visibility = "";
      breathAnim = sc.me.breath.animate(
         [
            { transform: "scaleY(1)", easing: IN_OUT },
            { transform: "scaleY(1.006)", offset: 0.5, easing: IN_OUT },
            { transform: "scaleY(1)" },
         ],
         { duration: 3000, iterations: Infinity },
      );
      breathAnim.pause();
      running = true;
      lastScore = null;
   }
   function destroyAnims(): void {
      for (const a of actors) {
         for (const { an } of a.anims) an.cancel();
         a.anims = [];
         a.where = "street";
         a.el.hidden = false;
         a.smear = -1;
      }
      breathAnim?.cancel();
      leanAnim?.cancel();
      breathAnim = leanAnim = null;
      for (const an of [...shots]) an.cancel();
      heldShots = [];
      running = false;
   }

   // Apply the rate of each lane (the master rate, delayed by depth) to its
   // walkers.
   function applyRate(force = false): void {
      if (!running) return;
      const live = visible && !reduced;
      for (const a of actors) {
         if (a.where === "gone") continue;
         const r = history[LAG[a.lane]] ?? master;
         for (const { an } of a.anims) {
            if (!live || r === 0) {
               if (an.playState !== "paused") an.pause();
               continue;
            }
            if (an.playState === "paused") {
               an.playbackRate = r;
               an.play();
            } else if (force || an.playbackRate !== r) an.updatePlaybackRate(r);
         }
         // speed smear on the walker: stretch and lean, capped at scaleX 1.18
         const m = clamp01((Math.abs(r) - 1) / 2);
         const key = Math.round(m * 8) * Math.sign(r || 1);
         if (key !== a.smear) {
            a.smear = key;
            a.poseEl.style.transform = m
               ? `scaleX(${a.dir}) skewX(${(-6 * m * Math.sign(r)).toFixed(2)}deg) scaleX(${(1 + 0.18 * m).toFixed(3)})`
               : `scaleX(${a.dir})`;
         }
      }
      if (!breathAnim) return;
      if (live && !is("sitting", "asleep")) {
         if (breathAnim.playState === "paused") breathAnim.play();
      } else if (breathAnim.playState !== "paused") breathAnim.pause();
   }
   function pushRate(r: number): void {
      master = q4(r);
      const changed = history.some((v) => v !== master);
      history.unshift(master);
      history.length = 4;
      if (changed) applyRate();
   }
   function setRate(r: number): void {
      master = r;
      history.fill(r);
   }

   function startTicker(): void {
      if (ticker || !visible || reduced || is("sitting", "asleep")) return;
      lastTick = performance.now();
      ticker = window.setInterval(tick, TICK_MS);
   }
   function stopTicker(): void {
      window.clearInterval(ticker);
      ticker = 0;
   }

   // how far the email control has slowed the street, 0 to 1, or null
   function holdNow(now: number): number | null {
      if (!hold) return null;
      if (hold.by === "slide") return hold.progress;
      if (now - hold.t0 > hold.ms + PRESS_GRACE_MS) {
         hold = null;
         return null;
      }
      return clamp01((now - hold.t0) / hold.ms);
   }

   function tick(): void {
      const now = performance.now();
      const dt = Math.max(16, now - lastTick);
      lastTick = now;
      const d =
         Math.abs(acc.scroll) >= Math.abs(acc.input) ? acc.scroll : acc.input;
      acc.scroll = acc.input = 0;
      const v = d / dt;
      vel =
         Math.abs(v) >= Math.abs(vel) * 0.6 && v !== 0
            ? v * 0.7 + vel * 0.3
            : vel * 0.45;
      if (Math.abs(vel) < 0.04) vel = 0;
      const held = holdNow(now);

      let next = master;
      if (is("freeze"))
         next = 0; // compose() drives the clocks to the stop
      else if (is("resume")) {
         const u = Math.min(1, (now - rampAt) / 600);
         next = u * u;
         if (u >= 1) setMode("run");
      } else if (is("run", "empty")) {
         let target = 1;
         if (held !== null) target = 1 - held;
         else if (vel !== 0)
            target = Math.sign(vel) * Math.min(3, 1 + Math.abs(vel) * 0.9);
         target = q4(target);
         next = target;
         // speed up at once, slow down a step at a time: the street
         // decelerates
         if (
            held === null &&
            Math.sign(target) === Math.sign(master) &&
            Math.abs(target) < Math.abs(master)
         )
            next = master - 0.25 * Math.sign(master);
         else if (held === null && master < 0 && target > 0)
            next = Math.min(target, master + 0.5);
      }
      pushRate(next);

      const t = scoreTime();
      if (is("run")) {
         // the freeze: in view, at rest for 250 ms. Arriving in view arms it
         // as well as any move does, whatever the velocity was, so a visitor
         // who lands at the page end and stops always gets it; `armed` only
         // stops a second freeze in the same rest.
         if (armed && held === null && half && now - lastMove >= REST_MS) {
            if (now - lastFreeze >= FREEZE_GAP_MS) freeze(now);
            else if (now - lastMove > 1800) armed = false;
         }
         // walkers waiting off stage step in when their pass comes round
         for (const a of actors) {
            if (a.where === "wings" && !at(a, tOf(a)).on) {
               a.where = "street";
               a.el.hidden = false;
            }
         }
         // the beat: she waves at him, he waves back
         if (lastScore !== null && master > 0 && is("run")) {
            const cue = mod(L.still - 0.1, L.L);
            const crossed =
               lastScore <= t
                  ? lastScore < cue && cue <= t
                  : lastScore < cue || cue <= t;
            if (crossed) waveBack();
         }
         // rush hour ends after 20 s without input
         if (is("run") && held === null && now - lastInput >= IDLE_MS) empty();
      } else if (is("empty")) {
         // nobody new arrives: each walker leaves at the end of its pass
         let left = 0;
         for (const a of actors) {
            if (
               a.where !== "gone" &&
               (a.where === "wings" || !at(a, tOf(a)).on)
            ) {
               a.where = "gone";
               a.el.hidden = true;
               for (const { an } of a.anims) an.pause();
            }
            if (a.where === "gone") left++;
         }
         if (left === actors.length) {
            setMode("sitting");
            showPose("sit", "sit");
            applyRate();
            stopTicker();
            beats.after(DOZE_MS, () => {
               if (!is("sitting")) return;
               showPose("sleep", "fade");
               setMode("asleep");
            });
         }
      }
      lastScore = is("run") ? t : null;
   }

   function waveBack(): void {
      showPose("wave", "squash");
      asides.cancel(waveBackT);
      waveBackT = asides.after(1300, () => {
         if (is("run", "resume")) showPose("idle", "squash");
      });
   }

   /* ---------- the freeze ----------
      The street glides to a composed stop, brackets snap in, he winks, then
      waves. */
   function freeze(now = performance.now()): void {
      if (!is("run", "resume")) return;
      const v0 = master;
      freezeMoved = 0;
      armed = false;
      lastFreeze = now;
      asides.cancel(waveBackT);
      setRate(0);
      setMode("freeze");
      applyRate(true); // every clock holds; compose() moves them from here
      // the photo is taken when the street stops: brackets and stamp snap in
      // on the last step of compose(), then he winks (held 650 ms) and waves
      const dur = compose(v0);
      const snap = Math.max(0, dur - 60);
      sc.stamp.textContent = stampText(new Date());
      sc.brackets.classList.add("st-on");
      sc.stamp.classList.add("st-on");
      snapIns = [
         shot(
            sc.brackets,
            [
               { opacity: 0, transform: "scale(1.15)" },
               { opacity: 1, transform: "scale(1)" },
            ],
            { duration: 140, delay: snap, easing: OUT, fill: "backwards" },
         ),
         shot(
            sc.stamp,
            [
               { opacity: 0, transform: "translateY(4px)" },
               { opacity: 1, transform: "none" },
            ],
            {
               duration: 260,
               delay: snap + 120,
               easing: "ease-out",
               fill: "backwards",
            },
         ),
      ];
      const winkAt = Math.max(350, dur + 40);
      const waveAt = winkAt + 650;
      beats.after(winkAt, () => {
         showPose("wink", "squash");
         // the wink lands on the email control
         ctx.email.pulse();
      });
      beats.after(waveAt, () => {
         showPose("wave", "squash");
         leanAnim?.cancel();
         // two sways that end before the release at 3500 ms
         const sway = Math.round((FREEZE_MS - waveAt - 450) / 2);
         leanAnim = shot(
            sc.me.pose,
            [
               { transform: "rotate(0deg)", easing: IN_OUT },
               { transform: "rotate(-1.4deg)", offset: 0.25, easing: IN_OUT },
               { transform: "rotate(1deg)", offset: 0.75, easing: IN_OUT },
               { transform: "rotate(0deg)" },
            ],
            { duration: sway, iterations: 2, delay: 300 },
         );
      });
      beats.after(FREEZE_MS, release);
   }

   /* Where the street stops is composed, not left to the scroll: from the
      natural stopping point (the rate easing out over about 320 ms) look
      ahead in 50 ms steps for the first score time with nobody near, mid or
      on the road inside his frame, then glide every clock there with an
      ease-out whose start speed matches the speed of the street. If no
      clear time is near, stop at the least crowded one, and whoever stands
      behind him in his frame steps back to the tone of the far lane: still
      solid (a see-through figure reads as a ghost on the lit street), just
      further away. A near walker passes in front of him at his shins and
      keeps its own tone. */
   let glide: {
      live: Walker[];
      own: number[];
      d: number;
      dur: number;
      t0: number;
      stepped: number;
   } | null = null;
   let glideFrame = 0;
   function glideStep(): void {
      glideFrame = 0;
      const g = glide;
      if (!g || !is("freeze") || !visible) return;
      const now = performance.now();
      // the clocks move at most 60 times a second, whatever the display
      if (now - g.stepped >= 15) {
         g.stepped = now;
         const u = Math.min(1, (now - g.t0) / g.dur);
         const e = 1 - (1 - u) ** 2;
         g.live.forEach((a, i) => setActorClock(a, (g.own[i] ?? 0) + g.d * e));
         if (u >= 1) {
            glide = null;
            return;
         }
      }
      glideFrame = requestAnimationFrame(glideStep);
   }
   function compose(v0: number): number {
      const sgn = Math.sign(v0) || 1;
      const d0 = 0.08 * v0;
      const live = actors.filter((a) => a.where !== "gone" && a.anims.length);
      const own = live.map(tOf);
      const hitsAt = (d: number): Walker[] =>
         live.filter(
            (a, i) =>
               a.where === "street" && clashes(L, a, (own[i] ?? 0) + d, c),
         );
      // a vehicle more than 30% cut off by an edge reads as a stray blob in
      // the still
      const blobsAt = (d: number): number =>
         live.filter(
            (a, i) =>
               a.where === "street" &&
               clipped(L, a, (own[i] ?? 0) + d, W) > 0.3,
         ).length;
      // a street that is already nearly still (the email control slowed it)
      // barely moves on
      const reach = Math.abs(v0) < 0.5 ? 4 : 24;
      let best = { d: d0, hit: hitsAt(d0), bad: Infinity };
      for (let k = 0; k <= reach; k++) {
         const d = d0 + sgn * k * 0.05;
         const hit = hitsAt(d);
         const bad = hit.length + blobsAt(d);
         if (bad < best.bad) best = { d, hit, bad };
         if (!bad) break;
      }
      // the composed still (she waves, nobody in his frame) wins when the
      // street can reach it
      const ref =
         waveActor && live.includes(waveActor) ? tOf(waveActor) : (own[0] ?? 0);
      const toStill = sgn * mod(sgn * (L.still - ref), L.L);
      if (
         Math.abs(v0) >= 0.5 &&
         Math.abs(toStill) >= Math.abs(d0) * 0.5 &&
         Math.abs(toStill) <= Math.max(1, Math.abs(v0))
      )
         best = { d: toStill, hit: hitsAt(toStill), bad: 0 };
      const { d, hit } = best;
      for (const a of hit) if (a.lane !== "near") a.el.classList.add("st-soft");
      const dur = Math.max(
         280,
         Math.min(800, (2000 * Math.abs(d)) / Math.max(1, Math.abs(v0))),
      );
      glide = { live, own, d, dur, t0: performance.now(), stepped: 0 };
      cancelAnimationFrame(glideFrame);
      glideFrame = requestAnimationFrame(glideStep);
      return dur;
   }
   function endFreezeLook(): void {
      glide = null;
      cancelAnimationFrame(glideFrame);
      glideFrame = 0;
      leanAnim?.cancel();
      leanAnim = null;
      sc.brackets.classList.remove("st-on");
      sc.stamp.classList.remove("st-on");
      // anyone stepped back for the photo takes their own tone again (a
      // 280 ms transition in street.css)
      for (const a of actors) a.el.classList.remove("st-soft");
   }
   function release(): void {
      if (!is("freeze")) return;
      beats.clear();
      rampAt = performance.now();
      if (!reduced) {
         shot(
            sc.brackets,
            [
               { opacity: 1, transform: "scale(1)" },
               { opacity: 0, transform: "scale(1.06)" },
            ],
            { duration: 220, easing: "ease-in" },
         );
         shot(sc.stamp, [{ opacity: 1 }, { opacity: 0 }], {
            duration: 220,
            easing: "ease-in",
         });
      }
      endFreezeLook();
      setMode("resume");
      showPose("idle", "squash");
   }
   // the photo stamp: the time and the zone, no place name
   function stampText(d: Date): string {
      const time = new Intl.DateTimeFormat("en-GB", {
         timeZone: ctx.timeZone,
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
      }).format(d);
      // en-IN names his zone by its short name (IST) where en-GB gives an
      // offset
      const zone =
         new Intl.DateTimeFormat("en-IN", {
            timeZone: ctx.timeZone,
            timeZoneName: "short",
         })
            .formatToParts(d)
            .find((p) => p.type === "timeZoneName")?.value ?? "";
      return `${time} ${zone}`.trim();
   }

   /* rush hour ends: nobody new arrives, he sits on the rail, then dozes */
   function empty(): void {
      asides.cancel(waveBackT);
      setMode("empty");
      showPose("idle");
   }
   /* any input: he wakes with a wave, and the score jumps to just before a
      busy stretch, so walkers come back in from both edges within a few
      beats */
   function wake(): void {
      if (!is("empty", "sitting", "asleep")) return;
      beats.clear();
      setMode("run");
      setRate(1);
      showPose("wave", "stand");
      beats.after(1100, () => showPose("idle", "squash"));
      const tw = mod(L.still - (L.phone ? 2.2 : 5.2), L.L);
      setClock(tw);
      for (const a of actors) {
         // already mid-pass: waits off stage for its next pass
         a.where = at(a, tw).on ? "wings" : "street";
         a.el.hidden = a.where === "wings";
      }
      lastScore = null;
      applyRate(true);
      startTicker();
   }

   /* ---------- input ---------- */
   function onMoveInput(d: number): void {
      const now = performance.now();
      lastMove = now;
      lastInput = now;
      armed = true;
      if (is("freeze") && (freezeMoved += Math.abs(d)) > 24) {
         // a real scroll during the freeze lets the street go at once; the
         // photo that was about to snap in never shows
         beats.clear();
         for (const an of snapIns) an.cancel();
         snapIns = [];
         endFreezeLook();
         setMode("run");
         showPose("idle");
      }
      wake();
      startTicker();
   }
   // Page scroll is read as net movement every 60 ms: sub-pixel jitter at
   // the page end, a jump that is undone at once, or the page shifting
   // because the viewport changed size (the URL bar of a phone) is not a
   // visitor moving. The position is only ever read: Lenis owns scrolling.
   let scrollCheck = 0;
   let jumpCheck = 0; // a big jump, waiting to see whether it is undone at once
   const moved = (d: number): void => {
      acc.scroll += d;
      onMoveInput(d);
   };
   const onScroll = (): void => {
      if (scrollCheck || jumpCheck) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      scrollCheck = window.setTimeout(() => {
         scrollCheck = 0;
         const d = window.scrollY - lastY;
         if (
            window.innerWidth !== vw ||
            window.innerHeight !== vh ||
            performance.now() - lastResize < 300
         ) {
            lastY = window.scrollY;
            return;
         }
         if (Math.abs(d) < 3) return;
         if (Math.abs(d) > 400) {
            const from = lastY;
            jumpCheck = window.setTimeout(() => {
               jumpCheck = 0;
               const net = window.scrollY - from;
               lastY = window.scrollY;
               if (Math.abs(net) >= 3) moved(net);
            }, 160);
            return;
         }
         lastY = window.scrollY;
         moved(d);
      }, 60);
   };
   const markResize = (): void => {
      lastResize = performance.now();
      lastY = window.scrollY;
   };
   // At the page end the wheel and a touch drag move nothing, so they drive
   // the street themselves.
   const onWheel = (e: WheelEvent): void => {
      const unit =
         e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const d = e.deltaY * unit;
      acc.input += d;
      onMoveInput(d);
   };
   const anyInput = (): void => {
      lastInput = performance.now();
      wake();
   };
   let touchY: number | null = null;
   const onTouchStart = (e: TouchEvent): void => {
      touchY = e.touches[0]?.clientY ?? null;
      anyInput();
   };
   const onTouchMove = (e: TouchEvent): void => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      const d = touchY - y;
      if (Math.abs(d) < 3) return;
      acc.input += d;
      touchY = y;
      onMoveInput(d);
   };
   // The window is listened to only while the street is in view and moving.
   let listening: AbortController | null = null;
   function listen(): void {
      if (listening || !visible || reduced) return;
      listening = new AbortController();
      const options = { passive: true, signal: listening.signal };
      lastY = window.scrollY;
      window.addEventListener("scroll", onScroll, options);
      window.addEventListener("resize", markResize, options);
      window.visualViewport?.addEventListener("resize", markResize, options);
      window.addEventListener("wheel", onWheel, options);
      window.addEventListener("touchstart", onTouchStart, options);
      window.addEventListener("touchmove", onTouchMove, options);
      for (const type of ["pointermove", "pointerdown", "keydown"])
         window.addEventListener(type, anyInput, options);
   }
   function unlisten(): void {
      listening?.abort();
      listening = null;
      window.clearTimeout(scrollCheck);
      window.clearTimeout(jumpCheck);
      scrollCheck = jumpCheck = 0;
      acc.scroll = acc.input = 0;
      vel = 0;
      touchY = null;
   }

   // Only a real arrival arms the freeze from here: the scene must have been
   // fully out of view since the last arming, and no resize may be under way
   // (the URL bar of a phone can cross the half line without anyone moving).
   const view = new IntersectionObserver(
      (entries) => {
         for (const e of entries) {
            const now = e.intersectionRatio >= 0.5;
            const steady = performance.now() - lastResize >= 300;
            if (!e.isIntersecting && steady) wasOut = true;
            // crossing into view arms the freeze and starts the 250 ms rest
            if (now && !half && wasOut && steady) {
               armed = true;
               wasOut = false;
               lastMove = performance.now();
            }
            half = now;
         }
      },
      { threshold: [0, 0.5, 1] },
   );
   view.observe(root);

   /* ---------- the still, and switching between still and motion ---------- */
   function still(): void {
      beats.clear();
      asides.clear();
      stopTicker();
      unlisten();
      hold = null;
      endFreezeLook(); // a freeze cut short by the toggle leaves nobody stepped back
      destroyAnims();
      placeStill(stillTime());
      sc.stamp.textContent = stampText(o.loadTime);
      sc.brackets.classList.add("st-on");
      sc.stamp.classList.add("st-on");
      showPose("wave");
      setMode("run");
   }
   function motion(): void {
      endFreezeLook();
      showPose("idle");
      setRate(1);
      createAnims();
      setMode("run");
      if (visible) enter();
   }
   // the street starts: he and the kerb come in with it
   function enter(): void {
      listen();
      applyRate(true);
      startTicker();
      lastInput = performance.now(); // arriving here is the input of the visitor
      if (entered) return;
      entered = true;
      shot(
         sc.me.inner,
         [{ transform: "translateY(14px)" }, { transform: "none" }],
         { duration: 460, easing: OUT },
      );
      shot(
         sc.kerb,
         [
            { transform: "scaleX(0.3)", opacity: 0.4 },
            { transform: "none", opacity: 1 },
         ],
         { duration: 620, easing: OUT },
      );
   }

   showPose("idle");
   if (reduced) still();
   else motion();

   // the email control drives the street too (the lab's Street.hold and
   // Street.done)
   const slow = (next: Hold): void => {
      if (reduced || !visible) return;
      lastInput = performance.now();
      if (is("freeze")) return;
      if (is("resume")) setMode("run"); // the control takes over the ramp
      hold = next;
      startTicker();
   };
   const letGo = (): void => {
      hold = null;
      lastInput = performance.now();
   };
   const photo = (): void => {
      hold = null;
      if (reduced || !visible) return;
      freeze();
   };

   return {
      setVisible(next) {
         if (dead || next === visible) return;
         visible = next;
         lights();
         // held still, as it is: every timer, every animation
         if (next) {
            beats.release();
            asides.release();
         } else {
            beats.hold();
            asides.hold();
         }
         if (reduced) return;
         if (next) {
            const now = performance.now();
            // the rest before a freeze counts from the moment the street shows
            if (armed) lastMove = now;
            if (is("freeze")) {
               // a freeze that was held is an old photo by now: the street
               // just runs again (the lab draft ended it on leaving view)
               for (const an of heldShots) an.cancel();
               beats.clear();
               endFreezeLook();
               setRate(1);
               setMode("run");
               showPose("idle");
            } else
               for (const an of heldShots)
                  if (an.playState === "paused") an.play();
            heldShots = [];
            // coming back is input: he wakes if rush hour had ended
            wake();
            enter();
         } else {
            unlisten();
            stopTicker();
            hold = null;
            heldShots = [...shots].filter((an) => an.playState === "running");
            for (const an of heldShots) an.pause();
            cancelAnimationFrame(glideFrame);
            glideFrame = 0;
            applyRate(true);
         }
      },
      setReduced(next) {
         if (dead || next === reduced) return;
         reduced = next;
         if (next) still();
         else if (!running) motion();
      },
      wave() {
         if (dead) return;
         if (reduced) {
            showPose(cur === "wave" ? "idle" : "wave");
            return;
         }
         if (!visible || is("freeze")) return;
         if (is("empty", "sitting", "asleep")) {
            lastInput = performance.now();
            wake();
            return;
         }
         showPose("wave", "squash");
         asides.cancel(waveT);
         waveT = asides.after(1100, () => {
            if (!is("freeze")) showPose("idle", "squash");
         });
      },
      email: {
         holdStart: (ms) => slow({ by: "press", t0: performance.now(), ms }),
         holdCancel: letGo,
         copied: photo,
         slide: (progress) =>
            slow({ by: "slide", progress: clamp01(progress) }),
         slideEnd: (sent) => (sent ? photo() : letGo()),
      },
      destroy() {
         if (dead) return;
         dead = true;
         visible = false;
         view.disconnect();
         unlisten();
         stopTicker();
         beats.clear();
         asides.clear();
         cancelAnimationFrame(glideFrame);
         glide = null;
         destroyAnims();
         street.replaceChildren();
         delete root.dataset.mode;
      },
   };
}

export const mount: FooterSceneMount<"street"> = (stage, ctx) => {
   const root = el("st-scene");
   const street = el("st-street");
   street.setAttribute("aria-hidden", "true");
   // him as a button: hover or tap and he waves
   const hit = document.createElement("button");
   hit.type = "button";
   hit.className = "st-me-hit";
   hit.setAttribute("aria-label", ctx.copy.wave);
   root.append(street, hit);
   stage.append(root);

   const loadTime = new Date();
   let reduced = ctx.reduced;
   let shown = false;
   let dead = false;
   let show: Show | null = null;
   /** ctx.ready() has been called (once per mount). */
   let readied = false;
   /** The size the street is built for, or being loaded for. */
   let size = { w: 0, h: 0 };
   let request = 0;
   let settle = 0;

   // Decoded once per file; the Image is kept so its bitmap stays cached for
   // the CSS background that uses the same URL. A file that fails still
   // resolves: the street plays without it.
   const images = new Map<
      string,
      { img: HTMLImageElement; done: Promise<void> }
   >();
   const decode = (src: string): Promise<void> => {
      const known = images.get(src);
      if (known) return known.done;
      const img = new Image();
      img.src = src;
      const done = img.decode().catch(() => undefined);
      images.set(src, { img, done });
      return done;
   };

   // Builds the street for the size the stage has now: its painting and his
   // strip decode first, so the first frame is whole.
   const refresh = (): void => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (dead || !w || !h || (w === size.w && h === size.h)) return;
      size = { w, h };
      const L = layoutFor(w, h);
      const frames = memberFrames("sagar", L.H);
      // the smaller painting whenever it covers a drawn tile (the strips'
      // size rule); phones always take it
      const tile = L.art.P * ART.ratio;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const painting = L.phone || tile * dpr * 0.85 <= 1280 ? art1280 : art2560;
      const mine = ++request;
      void Promise.all([decode(painting), decode(frames.src)]).then(() => {
         if (dead || mine !== request) return;
         show?.destroy();
         root.classList.toggle("st-phone", L.phone);
         root.style.setProperty("--st-art", `url("${painting}")`);
         show = createShow({
            root,
            street,
            hit,
            L,
            W: w,
            frames,
            ctx,
            reduced,
            first: !readied,
            loadTime,
         });
         if (!readied) {
            // the shell fades the scene in; the street fades by itself only
            // when the shell is already showing it (its 4 s fallback)
            street.classList.toggle("st-late", shown);
            street.classList.add("st-ready");
         }
         show.setVisible(shown);
         if (readied) return;
         readied = true;
         ctx.ready();
      });
   };
   const observer = new ResizeObserver(() => {
      window.clearTimeout(settle);
      if (show) settle = window.setTimeout(refresh, SETTLE_MS);
      else refresh();
   });
   observer.observe(root);
   refresh();

   const hover = new AbortController();
   hit.addEventListener("click", () => show?.wave(), { signal: hover.signal });
   hit.addEventListener(
      "pointerenter",
      (e) => {
         if (e.pointerType === "mouse") show?.wave();
      },
      { signal: hover.signal },
   );

   return {
      setReduced(next) {
         reduced = next;
         show?.setReduced(next);
      },
      setVisible(next) {
         shown = next;
         show?.setVisible(next);
      },
      // reaches the show on stage now; a rebuild swaps it
      email: {
         holdStart: (ms) => show?.email.holdStart(ms),
         holdCancel: () => show?.email.holdCancel(),
         copied: (quick) => show?.email.copied(quick),
         slide: (progress) => show?.email.slide(progress),
         slideEnd: (sent) => show?.email.slideEnd(sent),
      },
      destroy() {
         if (dead) return;
         dead = true;
         observer.disconnect();
         window.clearTimeout(settle);
         hover.abort();
         show?.destroy();
         show = null;
         images.clear();
         root.remove();
      },
   };
};
