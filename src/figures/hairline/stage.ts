/**
 * Adapted from hairline (https://github.com/lucasmarkes/hairline),
 * packages/hairline/src/core/stage.ts. MIT License.
 * Copyright (c) 2026 Lucas Marques. Full license in THIRD_PARTY_NOTICES.md.
 *
 * The DOM side every figure shares: making svg nodes, the helpers that write
 * a solid or a dot into them, one frame loop for every figure on the page,
 * the pointer, the tour and tear-down.
 *
 * Changes from hairline, all at the edges:
 * - No `matchMedia`. The site's Full/Reduced toggle calls `setReducedMotion`.
 * - The pointer maps into viewBox units through the svg's `getScreenCTM()`
 *   inverse, so a letterboxed or zoomed svg still hits where it is drawn.
 * - One clock, `now()`, which tests can drive with `__stepFigures`.
 *
 * Everything comes apart: `register` hands back an unregister, `pointer` a
 * disposer, and `disposer()` collects them so a figure's `destroy` is one
 * call. Once the last figure is unregistered no frame or observer is left.
 */

import {
   ghost,
   r2,
   type Camera,
   type PrismPaths,
   type Projector,
   type Sample,
   type Vec2,
} from "./iso";
import { EASE_LIFT, reducedMotion, setReducedFlag } from "./motion";

/* ---------- the contract ---------- */

/** Where an engine writes its caption. Only `textContent` is ever touched. */
export type Readout = { textContent: string | null };
export type FigureEls = {
   stage: HTMLElement;
   svg: SVGSVGElement;
   read: Readout;
   /** The viewBox, [w, h]: fit the drawing to it with `fitFrame`. */
   frame: Frame;
};
export type FigureHandle = { set(value: number): void; destroy(): void };
/** An engine: draws into `svg`, listens on `stage`, writes `read`. `value` is intensity, 0 to 1. */
export type FigureMount = (els: FigureEls, value: number) => FigureHandle;
/** What a figure module exports. `tour` is in viewBox units of `frame` (the surface's frame when unset). */
export type FigureModule = { mount: FigureMount; tour?: Tour; frame?: Frame };
/** A viewBox size, [w, h]. */
export type Frame = readonly [number, number];

/** The viewBox per surface: covers fill their 16:10 slot; banners letterbox the rest; services are square. */
export const FRAMES = {
   cover: [400, 250],
   banner: [400, 225],
   service: [320, 320],
   hairline: [400, 320],
} as const satisfies Record<string, Frame>;

/* ---------- svg ---------- */

const NS = "http://www.w3.org/2000/svg";
export type Attrs = Record<string, string | number>;

/** One svg element, with its attributes, appended to `parent` when there is one. */
export function mk<K extends keyof SVGElementTagNameMap>(
   tag: K,
   attrs?: Attrs | null,
   parent?: Element | null,
): SVGElementTagNameMap[K] {
   const e = document.createElementNS(NS, tag);
   if (attrs) for (const k in attrs) e.setAttribute(k, String(attrs[k]));
   if (parent) parent.appendChild(e);
   return e;
}

/** A solid's two paths in one group: the silhouette (`.sil`) and its crease (`.nf.lo`). */
export type Solid = { g: SVGGElement; sil: SVGPathElement; cr: SVGPathElement };
export function solid(parent: Element): Solid {
   const g = mk("g", {}, parent);
   return {
      g,
      sil: mk("path", { class: "sil" }, g),
      cr: mk("path", { class: "nf lo" }, g),
   };
}
/** Writes a prism's paths into a solid. */
export const put = (el: Solid, s: PrismPaths) => {
   el.sil.setAttribute("d", s.sil);
   el.cr.setAttribute("d", s.crease);
};

/** A dot lying flat on a horizontal plane: an ellipse squashed by the camera. Position it with `place`. */
export const flatDot = (parent: Element, C: Camera, r: number, cls: string) =>
   mk(
      "ellipse",
      { rx: r2(r * C.S), ry: r2(r * C.S * C.k), class: cls },
      parent,
   );
export const place = (el: SVGElement, q: Vec2) => {
   el.setAttribute("cx", String(r2(q[0])));
   el.setAttribute("cy", String(r2(q[1])));
};

/** A vertical fade, as a mask, for reflections. Returns the `url(#...)` for a `mask` attribute. */
let fid = 0;
export function fade(
   svg: SVGSVGElement,
   y0: number,
   y1: number,
   a0 = 0.7,
): string {
   const id = "hl-fd" + ++fid,
      defs = mk("defs", {}, svg);
   const lg = mk(
      "linearGradient",
      {
         id: id + "g",
         gradientUnits: "userSpaceOnUse",
         x1: 0,
         y1: r2(y0),
         x2: 0,
         y2: r2(y1),
      },
      defs,
   );
   mk("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": a0 }, lg);
   mk("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }, lg);
   const m = mk(
      "mask",
      { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 400, height: 320 },
      defs,
   );
   mk("rect", { x: 0, y: 0, width: 400, height: 320, fill: `url(#${id}g)` }, m);
   return `url(#${id})`;
}

/** A prism's mirror under its floor: the far edge of the reflection and its two sides, fading out. */
export function reflect(
   svg: SVGSVGElement,
   parent: Element,
   P: Projector,
   front: (q: Sample) => boolean,
   ring: readonly Sample[],
   z0: number,
   depth: number,
) {
   const r = ghost(P, front, ring, z0, depth);
   const gh = mk("g", { class: "ghost", mask: fade(svg, r.y0, r.y1) }, parent);
   mk("path", { d: r.d }, gh);
}

/* ---------- one clock, one loop, asleep offscreen ---------- */

/** Set by `__stepFigures`: from then on the loop runs only when a test steps it. */
let manual: number | null = null;
/** The clock every figure stamps events with. Use it instead of performance.now(). */
export const now = () => manual ?? performance.now();

/** A figure's frame: dt in seconds (capped at 50ms), now in ms. Returns whether it wants another frame. */
export type Tick = (dt: number, now: number) => boolean | void;
export type Loop = {
   /** Ask for frames again after input; the loop runs until the tick returns false. */
   wake(): void;
   /** Leave the loop and the observer. Idempotent. */
   unregister(): void;
};
type Board = { stage: Element; tick: Tick; vis: boolean; awake: boolean };

let boards: Board[] = [];
/** The boards on each stage: a figure's engine and its tour share one stage. */
const byStage = new Map<Element, Set<Board>>();
let raf = 0,
   last = 0;
let io: IntersectionObserver | null = null;

/** Runs every awake board once at time t; `all` ignores visibility (the test clock). */
function advance(t: number, all: boolean): boolean {
   const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
   last = t;
   let any = false;
   for (const b of boards.slice())
      if ((all || b.vis) && b.awake) {
         /* a tick that throws sleeps alone: the error is reported as uncaught and every other board keeps its frames */
         try {
            b.awake = !!b.tick(dt, t);
         } catch (err) {
            b.awake = false;
            setTimeout(() => {
               throw err;
            });
         }
         any = any || b.awake;
      }
   return any;
}

function frame() {
   raf = advance(now(), false) ? requestAnimationFrame(frame) : 0;
}

function wake(b: Board) {
   b.awake = true;
   if (!raf && manual === null) {
      last = now();
      raf = requestAnimationFrame(frame);
   }
}

/**
 * The site's motion preference: Reduced is true. Springs and tweens land at
 * once and tours stop; the pointer still answers. Wakes every figure so the
 * change shows at once.
 */
export function setReducedMotion(on: boolean) {
   if (on === reducedMotion()) return;
   setReducedFlag(on);
   boards.forEach(wake);
}

/** The observer exists while at least one figure is registered. */
function start() {
   if (io) return;
   io = new IntersectionObserver(
      (es) => {
         for (const e of es) {
            const set = byStage.get(e.target);
            if (!set) continue;
            for (const b of set) {
               b.vis = e.isIntersecting;
               if (b.vis) wake(b);
            }
         }
      },
      { rootMargin: "80px" },
   );
}

function stop() {
   if (raf) cancelAnimationFrame(raf);
   raf = 0;
   io?.disconnect();
   io = null;
}

/**
 * Joins the shared loop. The tick runs once now, so the figure is drawn
 * before it is ever on screen, then on every frame while its stage is within
 * 80px of the viewport and it keeps returning true. Offscreen it sleeps.
 */
export function register(stage: Element, tick: Tick): Loop {
   start();
   const b: Board = { stage, tick, vis: false, awake: true };
   boards.push(b);
   const peers = byStage.get(stage);
   if (peers) {
      /* a stage already watched: the new board takes its peers' visibility, since the observer will not speak again until it changes */
      for (const p of peers) b.vis = p.vis;
      peers.add(b);
      if (b.vis) wake(b);
   } else {
      byStage.set(stage, new Set([b]));
      io!.observe(stage);
   }
   tick(0, now());
   let gone = false;
   return {
      wake: () => {
         if (!gone) wake(b);
      },
      unregister: () => {
         if (gone) return;
         gone = true;
         boards = boards.filter((x) => x !== b);
         const set = byStage.get(stage);
         if (set) {
            set.delete(b);
            if (!set.size) {
               byStage.delete(stage);
               io?.unobserve(stage);
            }
         }
         if (!boards.length) stop();
      },
   };
}

/* ---------- pointer ---------- */

export type PointerHandlers = {
   /** The pointer in viewBox units (400 x 320). */
   move(p: Vec2, e: PointerEvent): void;
   /** A press; `move` when absent. */
   down?(p: Vec2, e: PointerEvent): void;
   leave(e: PointerEvent): void;
};

/** The handlers each stage's pointer() was given, so a tour (or a test) can drive them. */
const handlers = new WeakMap<Element, PointerHandlers>();
/** The tour on each stage, told when a real pointer arrives and leaves. */
const touring = new WeakMap<Element, { hold(): void; release(): void }>();

/** Client pixels to viewBox units, through the svg's own transform, so letterboxing and CSS zoom do not skew it. */
function toViewBox(stage: HTMLElement, e: PointerEvent): Vec2 {
   const m = stage.querySelector("svg")?.getScreenCTM();
   if (!m) return [Number.NaN, Number.NaN];
   const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
   return [p.x, p.y];
}

/**
 * Pointer input in viewBox units. A mouse leaving acts at once; a finger
 * lifting holds the pose for 1.4s first, so a tap reads as a look rather
 * than a flash. Touch releases its capture on press, so dragging across the
 * stage keeps sending moves. Returns the disposer.
 */
export function pointer(stage: HTMLElement, on: PointerHandlers): () => void {
   handlers.set(stage, on);
   let tm = 0;
   const pt = (e: PointerEvent) => toViewBox(stage, e);
   /* a real pointer holds the stage's tour before the figure hears it, and frees it after the figure hears the leave */
   const move = (e: PointerEvent) => {
      clearTimeout(tm);
      touring.get(stage)?.hold();
      on.move(pt(e), e);
   };
   const down = (e: PointerEvent) => {
      clearTimeout(tm);
      touring.get(stage)?.hold();
      if (e.pointerType !== "mouse") stage.releasePointerCapture?.(e.pointerId);
      if (on.down) on.down(pt(e), e);
      else on.move(pt(e), e);
   };
   const leave = (e: PointerEvent) => {
      clearTimeout(tm);
      tm = window.setTimeout(
         () => {
            on.leave(e);
            touring.get(stage)?.release();
         },
         e.pointerType === "mouse" ? 0 : 1400,
      );
   };
   stage.addEventListener("pointermove", move);
   stage.addEventListener("pointerdown", down);
   stage.addEventListener("pointerleave", leave);
   return () => {
      clearTimeout(tm);
      if (handlers.get(stage) === on) handlers.delete(stage);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerleave", leave);
   };
}

/* ---------- the tour: an unseen pointer that walks a figure's stops ---------- */

/** Where an unseen pointer stops: a viewBox point, or null to leave the stage. */
export type Tour = ReadonlyArray<Vec2 | null>;
export type TourHandle = { stop(): void };

const TRAVEL = 900,
   DWELL = 1200,
   REST = 1800,
   RESUME = 1200,
   STAGGER = 450;
const GHOST = { pointerType: "ghost" } as PointerEvent;
/** How many tours have started on the page: the stagger that keeps a page of them out of step. */
let started = 0;

/** Where a pointer heading for `p` first touches the viewBox: the ray from the centre through `p` meets the edge. */
function entry([x, y]: Vec2): Vec2 {
   const dx = x - 200,
      dy = y - 160;
   if (!dx && !dy) return [200, 320];
   const k = Math.min(
      dx ? (dx > 0 ? 200 : -200) / dx : Infinity,
      dy ? (dy > 0 ? 160 : -160) / dy : Infinity,
   );
   return [200 + dx * k, 160 + dy * k];
}

/**
 * Walks `stops` on the figure under `stage`, calling the handlers its
 * pointer() was given as a hand would: in from the edge, TRAVEL to each stop
 * on EASE_LIFT, DWELL there, leave at a null stop and REST, then round
 * again. A real pointer or focus on the stage holds it; when they go it
 * waits RESUME and starts from the first stop. It sleeps offscreen and
 * leaves under Reduced. A figure never calls this; HairlineFigure does.
 */
export function tour(
   stage: HTMLElement,
   stops: Tour,
   onStop?: (index: number) => void,
): TourHandle {
   let i = 0; // the stop the ghost is heading to
   let wait = RESUME + STAGGER * (started++ % 4); // ms before the next travel begins
   let t = -1; // ms into the travel; -1 before it begins
   let at: Vec2 | null = null; // where the ghost is; null when off the stage
   let origin: Vec2 = [200, 320]; // where the current travel began
   let hand = false,
      keys = stage.contains(stage.ownerDocument.activeElement);
   let gone = false;

   const leave = () => {
      at = null;
      t = -1;
      handlers.get(stage)?.leave(GHOST);
   };
   const tick: Tick = (dt) => {
      if (hand || keys || !stops.length) return false;
      if (reducedMotion()) {
         if (at) leave();
         return false;
      }
      if (wait > 0) {
         wait -= dt * 1000;
         return true;
      }
      const stop = stops[i];
      if (stop === null) {
         if (at) leave();
         onStop?.(i);
         i = (i + 1) % stops.length;
         wait = REST;
         return true;
      }
      const h = handlers.get(stage);
      if (!h) return true; // the figure has not called pointer() yet, or has let it go
      if (t < 0) {
         origin = at ?? entry(stop);
         t = 0;
      }
      t = Math.min(TRAVEL, t + dt * 1000);
      const k = EASE_LIFT(t / TRAVEL);
      at = [
         origin[0] + (stop[0] - origin[0]) * k,
         origin[1] + (stop[1] - origin[1]) * k,
      ];
      h.move(at, GHOST);
      if (t < TRAVEL) return true;
      onStop?.(i);
      i = (i + 1) % stops.length;
      t = -1;
      wait = DWELL;
      return true;
   };

   /* a hand or the keyboard owns the handlers: the ghost drops where it was and says nothing until both are gone */
   const take = () => {
      at = null;
      t = -1;
   };
   const give = () => {
      if (hand || keys) return;
      i = 0;
      t = -1;
      wait = RESUME;
      board.wake();
   };
   const me = {
      hold: () => {
         hand = true;
         take();
      },
      release: () => {
         if (!hand) return;
         hand = false;
         give();
      },
   };
   const focusIn = () => {
      keys = true;
      take();
   };
   const focusOut = (e: FocusEvent) => {
      if (keys && !stage.contains(e.relatedTarget as Node | null)) {
         keys = false;
         give();
      }
   };
   stage.addEventListener("focusin", focusIn);
   stage.addEventListener("focusout", focusOut);
   touring.set(stage, me);
   const board = register(stage, tick);

   return {
      stop: () => {
         if (gone) return;
         gone = true;
         board.unregister();
         stage.removeEventListener("focusin", focusIn);
         stage.removeEventListener("focusout", focusOut);
         if (touring.get(stage) === me) touring.delete(stage);
         if (at) leave();
      },
   };
}

/* ---------- tear-down ---------- */

export type Disposer = {
   /** Something to run on dispose: a Loop's unregister, pointer()'s return, a clearTimeout. */
   add(fn: () => void): void;
   /** addEventListener, removed on dispose. */
   on<K extends keyof HTMLElementEventMap>(
      target: HTMLElement,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
   ): void;
   /** Runs everything added, last first, once. */
   dispose(): void;
};

/**
 * Collects a figure's tear-down, so its `destroy` can be `bag.dispose`:
 *
 *   const bag = disposer();
 *   const B = register(stage, tick); bag.add(B.unregister);
 *   bag.add(pointer(stage, { move, leave }));
 *   bag.add(() => svg.replaceChildren());
 *   return { set, destroy: bag.dispose };
 */
export function disposer(): Disposer {
   let fns: Array<() => void> = [];
   return {
      add: (fn) => {
         fns.push(fn);
      },
      on: (target, type, fn, opts) => {
         const h = fn as EventListener;
         target.addEventListener(type, h, opts);
         fns.push(() => target.removeEventListener(type, h, opts));
      },
      dispose: () => {
         const run = fns;
         fns = [];
         for (let i = run.length - 1; i >= 0; i--) run[i]();
      },
   };
}

/* ---------- test hooks (unused by the app, so the bundler drops them) ---------- */

/**
 * Test only. Switches the shared loop to a manual clock for the rest of the
 * module's life and advances it to `to` ms in 60 Hz frames, running every
 * awake board whether or not it is on screen. Call `__stepFigures(0)` before
 * mounting so every stamp starts from 0.
 */
export function __stepFigures(to: number) {
   if (manual === null) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      manual = last = to;
   }
   while (manual < to) {
      manual = Math.min(to, manual + 1000 / 60);
      advance(manual, true);
   }
}

/** Test only. The handlers a figure gave pointer() on `stage`, to drive it with viewBox points. */
export const __pointerOf = (stage: Element) => handlers.get(stage);
