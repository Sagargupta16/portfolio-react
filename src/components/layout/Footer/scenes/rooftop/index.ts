/* Footer scene "rooftop": a painted city rooftop at night, him at the centre
   and his friends around him (the default scene). A port of the footer lab's
   draft "Rooftop, after hours"; the show is show.ts, the painting and its
   small life backdrop.ts, the fit of the painting in the stage box
   geometry.ts.

   Lifecycle: mount builds the DOM and returns. The cast is laid out from the
   first ResizeObserver callback (layout has settled by then), the strips and
   the painting load and decode, and ctx.ready() follows once. A breakpoint
   change, or a clearly wider or narrower stage, rebuilds the cast on the
   same engine stage (the old actors and their moves go with stage.clear). */

import { MEDIA_QUERIES } from "@/constants/theme";
import { loadTroupe, type Stage } from "../cast";
import type { FooterSceneMount } from "../types";
import { buildBackdrop } from "./backdrop";
import { type Fit, fitFor } from "./geometry";
import { buildShow, type InputClock, type RooftopShow } from "./show";
import "./rooftop.css";

// Input that keeps the night away; listened to only while the scene shows.
const INPUT = [
   "pointermove",
   "pointerdown",
   "keydown",
   "wheel",
   "scroll",
   "touchstart",
] as const;
// The lab draft's rebuild rule: a breakpoint, or the half-width 12 px off.
const REBUILD_PX = 24;
const REBUILD_MS = 200;

export const mount: FooterSceneMount<"rooftop"> = (el, ctx) => {
   let reduced = ctx.reduced;
   let visible = false;
   let dead = false;

   const root = document.createElement("div");
   root.className = "rt-scene";
   root.setAttribute("aria-hidden", "true");
   const backdrop = buildBackdrop(root);
   // The engine's stage gets an element of its own.
   const castEl = document.createElement("div");
   castEl.className = "rt-cast";
   root.append(castEl);
   el.append(root);

   let stage: Stage | null = null;
   let show: RooftopShow | null = null;
   let built: Fit | null = null; // the box the cast was laid out for
   let latest: Fit | null = null;
   let load = 0; // the layout whose art is loading
   let loaded = false;
   let running = false;
   let announced = false;
   let rebuildTimer = 0;
   const clock: InputClock = { last: performance.now() };

   // In Reduced nothing loops, so there is nothing to hold: the still's DOM
   // stays exactly as it is while the stage goes off screen and back.
   const mark = (): void => {
      root.toggleAttribute("data-hold", !visible && !reduced);
      root.toggleAttribute("data-still", reduced);
   };
   mark();

   const onInput = (): void => {
      clock.last = performance.now();
   };
   let listening = false;
   const listen = (on: boolean): void => {
      if (on === listening) return;
      listening = on;
      for (const type of INPUT) {
         if (on) window.addEventListener(type, onInput, { passive: true });
         else window.removeEventListener(type, onInput);
      }
   };

   const run = (): void => {
      if (!stage || !show || running || !visible || reduced || !loaded) return;
      running = true;
      void stage.play(show.run);
   };

   const rebuild = (fit: Fit): void => {
      if (!stage || dead) return;
      built = fit;
      running = false;
      loaded = false;
      show?.dispose();
      show = buildShow(stage, fit, clock);
      if (reduced) show.still();
      show.hold(!visible);
      const gen = ++load;
      void Promise.all([stage.ready(), backdrop.paint(fit)]).then(() => {
         if (dead || gen !== load) return;
         loaded = true;
         if (!announced) {
            announced = true;
            ctx.ready();
         }
         run();
      });
   };

   const observer = new ResizeObserver((entries) => {
      const box = entries.at(-1)?.contentRect;
      if (dead || !box || box.width < 1 || box.height < 1) return;
      const wide = !matchMedia(MEDIA_QUERIES.mobile).matches;
      const fit = fitFor(box.width, box.height, wide);
      latest = fit;
      backdrop.place(fit);
      // An even width puts the actors' x = 0 on a whole pixel, so a still
      // never lands on half pixels (an odd-width phone, 473 px).
      castEl.style.width = `${2 * Math.floor(box.width / 2)}px`;
      if (!built) return rebuild(fit);
      // Back within tolerance of the built layout: a rebuild an earlier
      // callback scheduled has nothing left to fix, so drop it first.
      window.clearTimeout(rebuildTimer);
      if (
         built.wide === wide &&
         Math.abs(built.width - fit.width) < REBUILD_PX &&
         Math.abs(built.height - fit.height) < 2
      )
         return;
      rebuildTimer = window.setTimeout(() => {
         if (latest) rebuild(latest);
      }, REBUILD_MS);
   });

   void loadTroupe().then((troupe) => {
      if (dead) return;
      stage = troupe.stage(castEl);
      stage.reduced(reduced);
      if (!visible) stage.pause();
      observer.observe(root);
   });

   const live = (fn: (s: RooftopShow) => void): void => {
      if (!dead && loaded && show) fn(show);
   };

   return {
      setReduced: (next) => {
         if (dead || next === reduced) return;
         reduced = next;
         mark();
         if (!stage) return;
         stage.reduced(next); // turning Reduced on stops the show
         running = false;
         if (next) show?.still();
         else {
            show?.fromStill();
            run();
         }
      },
      setVisible: (next) => {
         if (dead || next === visible) return;
         visible = next;
         mark();
         show?.hold(!next);
         listen(next);
         if (!next) {
            stage?.pause();
            return;
         }
         clock.last = performance.now(); // coming into view counts as input
         stage?.resume();
         run();
      },
      email: {
         holdStart: (ms) => live((s) => s.email.holdStart(ms)),
         holdCancel: () => live((s) => s.email.holdCancel()),
         copied: (quick) => live((s) => s.email.copied(quick)),
         slide: (progress) => live((s) => s.email.slide(progress)),
         slideEnd: (sent) => live((s) => s.email.slideEnd(sent)),
      },
      destroy: () => {
         if (dead) return;
         dead = true;
         observer.disconnect();
         window.clearTimeout(rebuildTimer);
         listen(false);
         show?.dispose();
         stage?.destroy();
         show = null;
         stage = null;
         root.remove();
      },
   };
};
