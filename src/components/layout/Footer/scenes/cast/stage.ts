/* The cast's stage: actors, the show loop, group helpers and the clock
   (pausable timeouts and tracked Web Animations). Ported from the footer
   lab's cast.js. */

import { Actor, type ActorOptions, type HopOptions } from "./actor";
import type { CastMemberId } from "./art";
import { STOPPED, T } from "./motion";
import type { Troupe } from "./troupe";

export interface StageOptions {
   /** CSS px height of one frame at scale 1 (default 200). */
   unit?: number;
   /** CSS px from the stage's bottom edge up to the floor line (default 0). */
   floor?: number;
}

export interface RippleOptions {
   /** x the ripple starts from (default 0, the centre). */
   from?: number;
   /** ms of delay per 100 px of distance from `from` (default 70). */
   step?: number;
   /** ms of fixed per-actor jitter at most (default 50). */
   jitter?: number;
}

export interface ArriveOptions extends HopOptions {
   /** ms between landings, in the order given (default 170). */
   gap?: number;
}

/** One pass of a show: a finite async function. */
export type Show = (stage: Stage) => Promise<void>;

interface Timer {
   fn: () => void;
   left: number;
   at: number;
   id: number;
   reject?: (e: unknown) => void;
}

type Hold = "hidden" | "scene";

export class Stage {
   readonly troupe: Troupe;
   readonly el: HTMLElement;
   actors: Actor[] = [];
   private _unit = 200;
   private _floor = 0;
   private _timers = new Set<Timer>();
   private _anims = new Set<Animation>();
   private _held: Animation[] = [];
   private _holds = new Set<Hold>();
   private _paused = false;
   private _still = false;
   private _epoch = 0;
   private _dead = false;
   private readonly _onVisibility = (): void => {
      this._hold("hidden", document.hidden);
   };

   constructor(troupe: Troupe, el: HTMLElement, o: StageOptions = {}) {
      this.troupe = troupe;
      this.el = el;
      el.classList.add("cast-stage");
      this.unit = o.unit ?? 200;
      this.floor = o.floor ?? 0;
      // A hidden tab holds the stage too, without touching the scene's own pause.
      document.addEventListener("visibilitychange", this._onVisibility);
      this._onVisibility();
   }
   /** CSS px height of one frame at scale 1; setting it resizes every actor. */
   get unit(): number {
      return this._unit;
   }
   set unit(v: number) {
      this._unit = v;
      for (const a of this.actors) a._size();
   }
   /** CSS px from the stage's bottom edge up to the floor line. */
   get floor(): number {
      return this._floor;
   }
   set floor(v: number) {
      this._floor = v;
      this.el.style.setProperty("--cast-floor", `${v}px`);
   }
   /** Half the stage width: x runs from -half to +half. A layout read: take
       it once per layout. */
   get half(): number {
      return this.el.clientWidth / 2;
   }
   /** True while anything holds the stage (pause() or a hidden tab). */
   get paused(): boolean {
      return this._paused;
   }
   /** Puts a member on the stage, hidden until ready(). */
   add(id: CastMemberId, o: ActorOptions = {}): Actor {
      const member = this.troupe.members.get(id);
      if (!member) throw new Error(`cast: no member "${id}" in the manifest`);
      const a = new Actor(this, member, o);
      this.actors.push(a);
      return a;
   }
   /** Loads and decodes every added actor's strip, then fades them in
       together. A strip that fails keeps its actor hidden. */
   async ready(): Promise<void> {
      const fresh = this.actors.filter((a) => !a._shown);
      for (const a of fresh) a._src = this.troupe._src(a.member, a.h);
      const images = await Promise.all(
         fresh.map((a) => this.troupe._load(a._src)),
      );
      fresh.forEach((a, k) => {
         if (!images[k] || a._shown || !a.el.isConnected) return; // a failed strip stays hidden
         a._shown = true;
         a.parts.strip.style.backgroundImage = `url("${a._src}")`;
         a.parts.root.style.opacity = "";
         if (!this._still) {
            this._animate(
               a.parts.root,
               [{ opacity: 0 }, { opacity: 1 }],
               T.fade,
               {
                  easing: "ease-out",
               },
            );
         }
         a._breathe();
      });
      this.troupe.release();
   }
   /** A pausable delay. Rejects (inside play) when the stage is stopped. In
       Reduced it resolves on the next task, so even a hand-written loop of
       waits yields to the page. */
   wait(ms: number): Promise<void> {
      if (this._dead) return Promise.reject(STOPPED);
      if (this._still) return new Promise((resolve) => setTimeout(resolve, 0));
      if (!(ms > 0)) return Promise.resolve();
      return new Promise((resolve, reject) => {
         this._after(ms, resolve).reject = reject;
      });
   }
   /** Freezes every timer and every running animation; nothing ticks. The
       scene calls it when its stage goes off screen. */
   pause(): void {
      this._hold("scene", true);
   }
   /** Carries on from the same instant (a hidden tab still holds). */
   resume(): void {
      this._hold("scene", false);
   }
   private _hold(why: Hold, on: boolean): void {
      if (on) this._holds.add(why);
      else this._holds.delete(why);
      const want = this._holds.size > 0;
      if (want === this._paused) return;
      this._paused = want;
      if (want) {
         const now = performance.now();
         for (const t of this._timers) {
            clearTimeout(t.id);
            t.left = Math.max(0, t.left - (now - t.at));
         }
         this._held = [...this._anims].filter((a) => a.playState === "running");
         for (const a of this._held) a.pause();
      } else {
         for (const t of this._timers) this._arm(t);
         for (const a of this._held) if (a.playState === "paused") a.play();
         this._held = [];
      }
   }
   /** Reduced: every move ends at once, nothing breathes, waits are
       instant. Compose the still with set() and pose() after reduced(true);
       after reduced(false), call play() again. No argument reads the flag. */
   reduced(flag?: boolean): boolean {
      if (flag === undefined || flag === this._still) return this._still;
      this._still = flag;
      if (this._still) {
         this.stop();
         for (const a of [...this._anims]) a.cancel(); // breath and fades; end states are inline
         for (const a of this.actors) a._breath = null;
      } else for (const a of this.actors) a._breathe();
      return this._still;
   }
   /** Ends the running show: moves jump to their end state, waits reject
       with STOPPED. */
   stop(): void {
      this._epoch++;
      for (const a of this.actors) a._halt();
      for (const t of [...this._timers]) {
         if (!t.reject) continue;
         this._cancel(t);
         t.reject(STOPPED);
      }
   }
   /** Runs show(stage) and loops it until stop() (a pass under 50 ms stops
       the loop). Swallows STOPPED. */
   async play(
      show: Show,
      { loop = true }: { loop?: boolean } = {},
   ): Promise<void> {
      this.stop();
      const ep = this._epoch;
      try {
         for (;;) {
            const t0 = performance.now();
            await show(this);
            // a pass with no waits in it would spin the page: stop instead
            if (
               !loop ||
               this._still ||
               ep !== this._epoch ||
               performance.now() - t0 < 50
            )
               break;
         }
      } catch (e) {
         if (e !== STOPPED) throw e;
      }
   }
   /** fn(actor, i) for each actor, delayed by its distance from x = from
       (step ms per 100 px) plus a fixed per-actor jitter, so neighbours
       never move in lockstep. */
   ripple<R>(
      actors: readonly Actor[],
      fn: (a: Actor, i: number) => R | Promise<R>,
      { from = 0, step = 70, jitter = 50 }: RippleOptions = {},
   ): Promise<R[]> {
      return this.together(actors, (a, i) =>
         this.wait((Math.abs(a.x - from) / 100) * step + a.seed * jitter).then(
            () => fn(a, i),
         ),
      );
   }
   /** fn(actor, i) for each actor at once; resolves when all have. */
   together<R>(
      actors: readonly Actor[],
      fn: (a: Actor, i: number) => R | Promise<R>,
   ): Promise<R[]> {
      return Promise.all(actors.map((a, i) => fn(a, i)));
   }
   /** fn(actor, i) in the order given, starts gap ms apart. */
   stagger<R>(
      actors: readonly Actor[],
      fn: (a: Actor, i: number) => R | Promise<R>,
      gap = 380,
   ): Promise<R[]> {
      return this.together(actors, (a, i) =>
         this.wait(i * gap).then(() => fn(a, i)),
      );
   }
   /** Hops each actor to to(actor, i), starting each hop so the landings
       fall `gap` ms apart in the order given (a ripple of arrivals). */
   arrive(
      actors: readonly Actor[],
      to: (a: Actor, i: number) => number,
      { gap = 170, ...hop }: ArriveOptions = {},
   ): Promise<Actor[]> {
      const xs = actors.map((a, i) => to(a, i));
      const ms = actors.map((a, i) => a.hopTime(xs[i] ?? a.x, hop));
      const t0 = Math.max(0, ...ms.map((d, k) => d - k * gap));
      return this.together(actors, (a, k) =>
         this.wait(t0 + k * gap - (ms[k] ?? 0)).then(() =>
            a.hopTo(xs[k] ?? a.x, hop),
         ),
      );
   }
   /** Removes every actor (the stage stays usable: add, then ready()). */
   clear(): void {
      this.stop();
      for (const a of [...this.actors]) a.remove();
   }
   /** Done with the stage for good: actors, timers, animations, the
       visibility listener, the stage's own class and floor property, and the
       troupe's hold on the strips all go. A new stage can be built on the
       same element afterwards. */
   destroy(): void {
      if (this._dead) return;
      this.clear();
      this._dead = true;
      for (const t of [...this._timers]) this._cancel(t);
      for (const a of [...this._anims]) a.cancel();
      this._held = [];
      document.removeEventListener("visibilitychange", this._onVisibility);
      this.el.classList.remove("cast-stage");
      this.el.style.removeProperty("--cast-floor");
      this.troupe._stages.delete(this);
      this.troupe.release();
   }

   /* ---- the clock: pausable timeouts and tracked animations ---- */
   _after(ms: number, fn: () => void): Timer {
      const t: Timer = { fn, left: Math.max(0, ms), at: 0, id: 0 };
      this._timers.add(t);
      if (!this._paused) this._arm(t);
      return t;
   }
   private _arm(t: Timer): void {
      t.at = performance.now();
      t.id = window.setTimeout(() => {
         this._timers.delete(t);
         t.fn();
      }, t.left);
   }
   private _cancel(t: Timer): void {
      clearTimeout(t.id);
      this._timers.delete(t);
   }
   _animate(
      el: HTMLElement,
      keyframes: Keyframe[],
      ms: number,
      opts: KeyframeAnimationOptions = {},
   ): Animation {
      const a = el.animate(keyframes, { duration: ms, fill: "none", ...opts });
      this._anims.add(a);
      const drop = (): void => {
         this._anims.delete(a);
      };
      a.addEventListener("finish", drop);
      a.addEventListener("cancel", drop);
      if (this._paused) {
         a.pause();
         this._held.push(a);
      }
      return a;
   }
}
