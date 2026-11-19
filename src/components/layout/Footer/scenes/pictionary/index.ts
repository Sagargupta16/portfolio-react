/* The footer scene "Pictionary", ported from the footer lab's draft
   "Pictionary night" (pictionary-night/night.js).
   He hosts a round of Pictionary about what he does. His friends sit on a
   bench in front of the board, shout guesses, jump up when they get it, and
   the reader can beat them to it with the answer chips.

   The show (the cast engine's async style, every delay a pausable
   stage.wait):
     entrance  he hops in beside the board and waves; the players hop in
               from the left in one stream and land on the bench far seat
               first
     a doodle  the marker draws; one player hops off the bench, raises a
               hand and guesses wrong; the neighbours react (one leans in,
               one away); he winks or leans in; a beat; another jumps off
               the bench fists up with the right answer while the wrong one
               deflates; the row cheers in a ripple of seat-bounces outward
               from the one who got it (the wrong one waves along), he
               waves; both hop back onto the bench and the board wipes
               (about 6 s)
     the twist the reader taps the right chip first: the visitor in blue
               jumps up, he winks, the row turns toward the visitor and
               cheers from there; a wrong tap shakes the chip and the
               visitor shifts it off
     the end   the envelope flies out past the bench and down to the
               shell's email control, which lights up as the end line's
               accent word gets its underline (ctx.email.arrive); the
               whole row jumps once on one beat, the recap
               shows; then the scene rests (0 running animations) until
               "play again" or a tap on him; left alone 25 s, two players
               doze
   Reduced (the site's own toggle) shows a composed still; the chips still
   work.

   What the port changed: the whole play area lives in the footer's stage
   (the chips sit at its bottom edge), the end line and the email control
   are the shell's, and the ink runs on a stepped clock (board.ts). */

import "./pictionary.css";

import { EASING, MEDIA_QUERIES } from "@/constants/theme";
import { LOADING, type LoadState } from "@/types/loadState";
import { fillTemplate } from "@utils/fillTemplate";
import {
   type Actor,
   type HopOptions,
   loadTroupe,
   type Pose,
   type Stage,
   STOPPED,
} from "../cast";
import type { FooterSceneMount } from "../types";
import { createBoard, DOODLE_IDS, LAST, type Lane } from "./board";
import { button, decor, el, svg } from "./dom";
import { Fx } from "./fx";
import {
   CHIP_H,
   FADE,
   type Geo,
   type Layout,
   NARROW,
   RUN_IN,
   WIDE,
} from "./layout";

const EASE_POP = "cubic-bezier(0.3, 1.35, 0.6, 1)";
const EASE_STD = `cubic-bezier(${EASING.standard.join(", ")})`;
/** A player off the bench stands in front of the row. */
const STAND_Z = 24;
/** The engine's JUMP_SEAT: the jump frame's tucked thighs, as a fraction of
    its height. */
const JUMP_SEAT = 0.62;
/** Left alone this long at rest, two players doze. */
const DOZE_MS = 25000;
/** The show starts once this much of the stage has been on screen. */
const LAUNCH_RATIO = 0.4;
/** The envelope's way down: px it keeps from a player or a word (at least
    LANE_TIGHT where the room is short), from the screen's edge, and its
    smallest width there. */
const LANE_GAP = 10;
const LANE_TIGHT = 3;
const LANE_EDGE = 2;
const LANE_MIN = 10;

/* The scene's one lifecycle: nobody in yet, the show running, its last
   beats with "play again" already up, the rest after them, or Reduced's
   still. */
type Phase = "pre" | "play" | "outro" | "rest" | "still";
/* The answer chips: not taking a guess, taking one, or the doodle is
   solved. */
type Guess = "shut" | "open" | "solved";

/** The layout's marks plus what build() measures. */
interface Marks extends Geo {
   /** Half the play area's width. */
   sh: number;
   /** Where an entrant is out of sight, left and right. */
   edgeL: number;
   edgeR: number;
   /** His outline's left edge: speech chips stay left of it. */
   hostL: number;
   /** The board's bottom edge, px above the floor. */
   boardB: number;
   /** The lowest line any doodle draws, px above the floor: a jump under
       the board keeps its fists below it. */
   doodleB: number;
}

/** Everything one layout puts on the stage. */
interface Company {
   stage: Stage;
   L: Layout;
   /** What a rebuild is decided on: the stage's height, the play width and
       the entrance edge. */
   height: number;
   play: number;
   g: Marks;
   him: Actor;
   you: Actor;
   sitters: Actor[];
   /** actor -> seat x */
   seat: Map<Actor, number>;
   /** The bench's seat height, px above the floor. */
   bench: number;
   /** The strips: on their way, in (the data is how many actors show; one
       whose strip failed stays hidden), or the load itself failed. */
   art: LoadState<number>;
}

interface Said {
   el: HTMLElement;
   /** px from the scene's centre and bottom. */
   x: number;
   b: number;
   w: number;
   h: number;
}

const clamp = (v: number, lo: number, hi: number): number =>
   Math.min(hi, Math.max(lo, v));
// A move or wait nobody awaits: a stopped show is not an error.
const bg = (p: Promise<unknown>): void => {
   p.catch((e: unknown) => {
      if (e !== STOPPED) console.error(e);
   });
};
// A promise made now and awaited a few steps later: observed at once, so a
// stop in between is not reported, yet the later await still sees it.
const later = <T>(p: Promise<T>): Promise<T> => {
   bg(p);
   return p;
};
// Where an entrant is out of sight on a stage `w` px wide: the stage's
// edge, or on a wide stage (masked) the end of the cast layer's fade.
const wings = (
   L: Layout,
   w: number,
): { out: number; masked: boolean; edge: number } => {
   const out = L.play(w) / 2 + RUN_IN + FADE;
   const masked = w / 2 > out + 24;
   return { out, masked, edge: masked ? out : w / 2 };
};
// The top of the drawn figure in a frame, as a fraction of frame height.
const top = (a: Actor, pose: Pose): number =>
   (a.member.frames[pose]?.bbox[1] ?? 0) / a.stage.troupe.size[1];

export const mount: FooterSceneMount<"pictionary"> = (stageEl, ctx) => {
   const copy = ctx.copy;
   const doodles = DOODLE_IDS.map((id) => {
      const d = copy.doodles[id];
      return { ...d, options: [d.option_1, d.option_2, d.option_3] };
   });
   const fx = new Fx();
   const narrowQuery = matchMedia(MEDIA_QUERIES.mobile);

   /* ---- the picture ---- */
   const root = el("div", "pn");
   root.dataset.phase = "pre";
   stageEl.append(root); // in the page before the board measures its art
   const board = createBoard(
      root,
      copy.board,
      doodles.map((d) => d.answer),
      fx,
   );
   // The cast's own layer: the stage's full width, so an entrance starts
   // past the screen's edge (or in the dark, on a wide stage).
   const castEl = decor(el("div", "pn-cast"));
   const says = decor(el("div", "pn-says"));
   const pauseBtn = button(
      "pn-pause",
      copy.pause,
      decor(
         el(
            "span",
            "",
            svg(
               "svg",
               {
                  class: "pn-i-pause",
                  width: 12,
                  height: 12,
                  viewBox: "0 0 12 12",
               },
               svg("rect", { x: 2, y: 1.5, width: 2.6, height: 9, rx: 1 }),
               svg("rect", { x: 7.4, y: 1.5, width: 2.6, height: 9, rx: 1 }),
            ),
            svg(
               "svg",
               {
                  class: "pn-i-play",
                  width: 12,
                  height: 12,
                  viewBox: "0 0 12 12",
               },
               svg("path", { d: "M3 1.6 10.4 6 3 10.4Z" }),
            ),
         ),
      ),
   );
   // A tap on him at rest plays again.
   const hostHit = button("pn-host-hit", copy.replay);
   hostHit.hidden = true;
   const scene = el(
      "div",
      "pn-scene",
      decor(el("div", "pn-floor")),
      decor(
         svg(
            "svg",
            {
               class: "pn-easel",
               preserveAspectRatio: "none",
               viewBox: "0 0 100 100",
            },
            svg("line", { x1: 9, y1: 0, x2: 4, y2: 100 }),
            svg("line", { x1: 91, y1: 0, x2: 96, y2: 100 }),
         ),
      ),
      board.el,
      pauseBtn,
      decor(el("div", "pn-bench", el("i", ""), el("i", ""), el("i", ""))),
      castEl,
      says,
      hostHit,
   );

   /* ---- the answer chips ---- */
   const ansBtns = [0, 1, 2].map(() => button("pn-ans", null));
   const replayBtn = button(
      "pn-replay",
      null,
      decor(
         svg(
            "svg",
            { width: 13, height: 13, viewBox: "0 0 13 13" },
            svg("path", {
               d: "M2.5 6.5a4 4 0 1 0 1.3-2.95M2.4 1.8v2.4h2.4",
               fill: "none",
               stroke: "currentColor",
               "stroke-width": 1.4,
               "stroke-linecap": "round",
               "stroke-linejoin": "round",
            }),
         ),
      ),
      copy.replay,
   );
   const answers = el(
      "div",
      "pn-answers",
      decor(el("span", "pn-ans-label", copy.prompt)),
      ...ansBtns,
      replayBtn,
   );
   answers.setAttribute("role", "group");
   answers.setAttribute("aria-label", copy.prompt);
   const live = el("p", "pn-live");
   live.setAttribute("aria-live", "polite");
   root.append(scene, answers, live);

   /* ---- state ---- */
   let reduced = ctx.reduced;
   let visible = false; // the shell's setVisible
   let userPaused = false;
   let phase: Phase = "pre";
   let guess: Guess = "shut";
   let doodleNow = 0;
   let co: Company | null = null;
   let said: Said[] = [];
   let dozeTimer = 0;
   let waking = 0; // bits of business running while the scene rests
   // One-way latches: enough of the stage has been seen to start the show,
   // ctx.ready() has been called, the doze and the thank-you happened, and
   // destroy() ran.
   let seen = false;
   let announced = false;
   let dozed = false;
   let thanked = false;
   let dead = false;

   const seatOf = (c: Company, a: Actor): number => c.seat.get(a) ?? a.x;
   const zOf = (c: Company, a: Actor): number => 10 + c.sitters.indexOf(a);

   function setAnswers(i: number, fade: boolean): void {
      doodles[i].options.forEach((o, k) => {
         const b = ansBtns[k];
         b.textContent = o;
         b.dataset.right = o === doodles[i].answer ? "1" : "";
         b.classList.remove("pn-ok", "pn-shown", "pn-dim", "pn-nope");
         b.removeAttribute("aria-disabled");
      });
      answers.dataset.mode = "";
      answers.dataset.open = "1";
      if (fade)
         fx.run(answers, [{ opacity: 0.3 }, { opacity: 1 }], {
            duration: 320,
            easing: EASE_STD,
         });
   }
   function lockAnswers(reveal: boolean): void {
      if (guess === "open") guess = "shut";
      delete answers.dataset.open;
      for (const b of ansBtns) {
         b.setAttribute("aria-disabled", "true");
         if (reveal) b.classList.add(b.dataset.right ? "pn-shown" : "pn-dim");
      }
   }
   const announce = (template: string, answer: string): void => {
      live.textContent = fillTemplate(template, { answer });
   };

   /* ---- the layout ---- */
   function build(stage: Stage, L: Layout, w: number, h: number): Company {
      stage.clear();
      stage.unit = L.unit;
      stage.floor = L.floor;
      // The chips take the stage's bottom band; the scene is what is left.
      const band = L.pad + CHIP_H;
      const sceneH = h - band;
      const play = L.play(w);
      const sh = play / 2;
      const geo = L.geo(sh);
      const { out, masked, edge } = wings(L, w);
      root.toggleAttribute("data-masked", masked);

      const him = stage.add("sagar", { x: geo.host, z: 30 });
      // His outline's left edge (the waving arm reaches furthest).
      const frameW = stage.troupe.size[0];
      const left = Math.min(
         ...(["idle", "wave", "wink"] as const).map(
            (p) => him.member.frames[p]?.bbox[0] ?? frameW,
         ),
      );
      const scale = L.sit(sh);
      const seat = new Map<Actor, number>();
      const sitters = L.seats.map((id, k, list) => {
         const x = Math.round(
            geo.seatL + (k * (geo.seatR - geo.seatL)) / (list.length - 1),
         );
         const a = stage.add(id, { x, scale, z: 10 + k });
         seat.set(a, x);
         return a;
      });
      const you = sitters.find((a) => a.id === "visitor");
      if (!you) throw new Error("pictionary: the layout seats no visitor");
      // Tall enough that every sitter's feet hang clear of the floor.
      const bench = Math.round(
         Math.max(
            ...sitters.map((a) => {
               const row = a.ground("sit");
               return ((a.member.frames.sit?.bottom ?? row) - row) * a.h;
            }),
         ) + 2,
      );
      const heads =
         bench +
         Math.max(
            ...sitters.map((a) => (a.ground("sit") - top(a, "sit")) * a.h),
         );
      const boardB = Math.round(heads + geo.clear);
      const boardW = geo.boardR - geo.boardL;
      const boardH = sceneH - L.floor - boardB - geo.top;
      const inkLow = board.fit(boardW, boardH, L.ink, L.inkPx);
      const underBoard = L.chips === "board";
      const vars: Record<string, number> = {
         "--pn-band": band,
         "--pn-pad": L.pad,
         "--pn-half": sh,
         "--pn-floor": L.floor,
         "--pn-board-l": geo.boardL,
         "--pn-board-w": boardW,
         "--pn-board-b": boardB,
         "--pn-board-h": boardH,
         "--pn-bench-l": geo.benchL,
         "--pn-bench-w": geo.benchR - geo.benchL,
         "--pn-bench-h": bench,
         "--pn-host-x": geo.host,
         "--pn-host-h": L.unit,
         "--pn-ans-l": underBoard ? geo.boardL : -sh,
         "--pn-ans-w": underBoard ? boardW : play,
         "--pn-out": out,
         "--pn-in": out - FADE,
      };
      for (const [name, px] of Object.entries(vars))
         root.style.setProperty(name, `${px}px`);
      return {
         stage,
         L,
         height: h,
         play,
         g: {
            ...geo,
            sh,
            edgeL: -edge,
            edgeR: edge,
            hostL: Math.round(geo.host + (left / frameW - 0.5) * him.w),
            boardB,
            doodleB: Math.round(sceneH - L.floor - geo.top - inkLow),
         },
         him,
         you,
         sitters,
         seat,
         bench,
         art: LOADING,
      };
   }
   // Before the entrance: him past the right edge, the players past the
   // left, each one a frame's half width out of sight.
   function offstage(c: Company): void {
      const { g, him } = c;
      him.set({
         x: Math.round(g.edgeR + him.w * 0.5),
         y: 0,
         pose: "idle",
         flip: false,
      });
      for (const a of c.sitters)
         a.set({
            x: Math.round(g.edgeL - a.w * 0.5),
            y: 0,
            pose: "idle",
            z: zOf(c, a),
            flip: false,
         });
   }
   function seatAll(c: Company): void {
      c.him.set({ x: c.g.host, y: 0, pose: "idle", flip: false });
      for (const a of c.sitters)
         a.set({
            x: seatOf(c, a),
            y: c.bench,
            pose: "sit",
            z: zOf(c, a),
            flip: false,
         });
   }
   /* The lift for a hop of a from where it is to the floor or (toSeat) the
      bench at y1: the asked-for height, or less where the top of the jump
      frame (the fists) would rise into the doodle at the apex. The root
      runs linearly from take-off to landing under the lift's 4h t (1 - t),
      as in the engine; from or into a seat the jump frame is anchored
      JUMP_SEAT lower. */
   function lift(
      c: Company,
      a: Actor,
      want: number,
      y1: number,
      toSeat: boolean,
   ): number {
      const H = a.h;
      const gj = a.ground("jump");
      const drop = (gj - JUMP_SEAT) * H;
      const ys = a.mode === "stand" ? a.y : a.y - drop;
      const ye = toSeat ? y1 - drop : y1;
      const room = c.g.doodleB - 4 - (gj - top(a, "jump")) * H;
      const peak = (h: number): number => {
         let m = -Infinity;
         for (let i = 0; i <= 32; i++) {
            const t = i / 32;
            m = Math.max(m, ys + (ye - ys) * t + 4 * h * t * (1 - t));
         }
         return m;
      };
      if (peak(want) <= room) return Math.round(want);
      let lo = 0;
      let hi = want;
      for (let k = 0; k < 16; k++) {
         const m = (lo + hi) / 2;
         if (peak(m) <= room) lo = m;
         else hi = m;
      }
      return Math.max(Math.round(H * 0.12), Math.round(lo));
   }

   /* ---- speech chips over the guessers' heads ---- */
   /* A chip sits centred over its guesser's head. Its tail can be anywhere
      from 11 px to w - 11 px along it, so the chip may slide that far off
      centre and still point at the guesser: it slides to stay inside the
      play area, left of his outline, and beside a chip already up; where
      there is no room beside it, it stacks above that chip. */
   function say(
      c: Company,
      a: Actor,
      text: string,
      kind: "" | "pn-say-ok" | "pn-say-x" = "",
      seated = false,
   ): void {
      const { g, L } = c;
      const chip = el("span", kind ? `pn-say ${kind}` : "pn-say", text);
      says.append(chip);
      const head = seated
         ? c.bench + (a.ground("sit") - top(a, "sit")) * a.h
         : (a.ground("idle") - top(a, "idle")) * a.h;
      const w = chip.offsetWidth;
      const h = chip.offsetHeight;
      const sx = seatOf(c, a);
      const lo = Math.max(-g.sh + 4, sx - w + 11);
      const hi = Math.min(g.sh - 4, g.hostL - 6, sx + w - 11) - w;
      let x = clamp(sx - w / 2, lo, hi);
      // a seated guesser's chip still clears the board's bottom edge
      let b = Math.round(
         L.floor + Math.max(head + L.sayUp, seated ? g.boardB + 6 : 0),
      );
      for (const o of said) {
         if (b >= o.b + o.h + 2 || o.b >= b + h + 2) continue;
         if (x + w + 6 <= o.x || o.x + o.w + 6 <= x) continue;
         const nx = sx >= o.x + o.w / 2 ? o.x + o.w + 6 : o.x - w - 6;
         if (nx >= lo && nx <= hi) x = nx;
         else b = o.b + o.h + 5;
      }
      x = Math.round(x);
      chip.style.left = `calc(50% + ${x}px)`;
      chip.style.bottom = `${b}px`;
      chip.style.setProperty(
         "--pn-tail",
         `${Math.round(clamp(sx - x, 11, w - 11))}px`,
      );
      if (!reduced)
         fx.run(
            chip,
            [
               { opacity: 0, transform: "translateY(6px) scale(0.7)" },
               { opacity: 1, transform: "none" },
            ],
            { duration: 340, easing: EASE_POP },
         );
      said.push({ el: chip, x, b, w, h });
   }
   const strike = (): void => {
      for (const o of said) o.el.classList.add("pn-say-x");
   };
   function unsay(instant: boolean): void {
      for (const { el: chip } of said) {
         const remove = (): void => chip.remove();
         if (instant) remove();
         else
            fx.run(chip, [{ opacity: 1 }, { opacity: 0 }], {
               duration: 240,
               easing: EASE_STD,
               fill: "forwards",
            }).finished.then(remove, remove);
      }
      said = [];
   }

   /* ---- the moves the show is made of ---- */
   // Off the bench onto the floor in front of it (a small pop, or a big
   // jump). It lands light, in the crouch frame: the lunge frame would
   // swing an arm into the neighbours.
   const hopUp = (
      c: Company,
      a: Actor,
      height = 0.16,
      air?: number,
   ): Promise<Actor> => {
      a.set({ z: STAND_Z });
      return a.hopTo(seatOf(c, a), {
         y: 0,
         height: lift(c, a, a.h * height, 0, false),
         air,
         land: "crouch",
      });
   };
   // Back onto the bench and seated.
   const sitDown = (c: Company, a: Actor): Promise<Actor> =>
      a
         .hopTo(seatOf(c, a), {
            y: c.bench,
            sit: true,
            height: Math.round(a.h * 0.14),
         })
         .then(() => a.set({ z: zOf(c, a) }));
   // A bounce in the seat, fists up (the cheer).
   const pop = (
      c: Company,
      a: Actor,
      height = 0.18,
      air = 360,
   ): Promise<Actor> =>
      a.hopTo(seatOf(c, a), {
         y: c.bench,
         sit: true,
         height: lift(c, a, a.h * height, c.bench, true),
         air,
      });
   // The neighbours of a guesser: one leans in toward them, one leans away.
   async function react(s: Stage, c: Company, k: number): Promise<void> {
      const { sitters } = c;
      const W = sitters[k];
      const a = sitters[k - 1] ?? sitters[k + 2];
      const b = sitters[k + 1] ?? sitters[k - 2];
      const d = Math.round(a.h * 0.075);
      await s.wait(280);
      bg(a.nudge(Math.sign(W.x - a.x) * d, 820));
      await s.wait(240);
      bg(b.nudge(Math.sign(b.x - W.x) * d, 900));
   }

   /* ---- the game ---- */
   /* He hops in and waves; the players stream in from the left. The first
      doodle starts drawing as he lands or a second before the last player
      sits, whichever is later, so the board is never a blank card for long.
      Returns how far into that doodle the show is when the entrance ends. */
   async function entrance(s: Stage, c: Company): Promise<number> {
      const { g, him, L } = c;
      offstage(c);
      const hostHop = { hops: 2 };
      const landsIn = him.hopTime(g.host, hostHop);
      const host = later(him.hopTo(g.host, hostHop).then(() => him.wave(1300)));
      // One stream from the left at one ground speed, far seat first, so
      // nobody passes in front of someone already seated: stage.arrive
      // written out, so the first strokes can be timed against the last
      // landing.
      const LEAD = 480;
      const GAP = 170;
      const order = [...c.sitters].sort((a, b) => seatOf(c, b) - seatOf(c, a));
      const hops = order.map((a): HopOptions => ({
         y: c.bench,
         sit: true,
         speed: 0.42,
         hops: Math.max(
            1,
            Math.ceil(Math.abs(seatOf(c, a) - a.x) / (L.stride * a.h)),
         ),
      }));
      const ms = order.map((a, k) => a.hopTime(seatOf(c, a), hops[k]));
      const t0 = LEAD + Math.max(0, ...ms.map((d, k) => d - k * GAP));
      const seated = t0 + (order.length - 1) * GAP;
      const first = Math.max(landsIn, seated - 1000);
      bg(s.wait(first).then(() => begin(s, c, 0, true)));
      await s.together(order, (a, k) =>
         s
            .wait(t0 + k * GAP - ms[k])
            .then(() => a.hopTo(seatOf(c, a), hops[k])),
      );
      await host;
      await s.wait(260);
      return Math.max(seated, landsIn + 1300) + 260 - first;
   }

   // A doodle starts: its chips open, the marker draws, he leans toward it.
   // Early (inside the entrance) he is still waving and the chips stay shut
   // until everyone is in: a guess then would cut the entrance short.
   // Shut chips say so (aria-disabled); in Reduced they always answer.
   function openChips(): void {
      guess = "open";
      answers.dataset.open = "1";
      for (const b of ansBtns) b.removeAttribute("aria-disabled");
   }
   function shutChips(): void {
      guess = "shut";
      delete answers.dataset.open;
      if (!reduced)
         for (const b of ansBtns) b.setAttribute("aria-disabled", "true");
   }
   function begin(s: Stage, c: Company, i: number, early = false): void {
      doodleNow = i;
      setAnswers(i, i > 0);
      if (early) shutChips();
      else openChips();
      bg(board.draw(i, c.L.draw, (ms) => s.wait(ms)));
      if (!early) bg(c.him.nudge(-Math.round(c.him.h * 0.03), 1000));
   }

   // head: ms the doodle has been drawing already (the first one starts in
   // the entrance). The wrong guess comes at 850 ms, or soon after the
   // round starts, and the right one keeps its place after the last stroke.
   async function round(
      s: Stage,
      c: Company,
      i: number,
      head = 0,
   ): Promise<void> {
      const { him, sitters } = c;
      const D = doodles[i];
      const [w, r] = c.L.plan[i];
      const W = sitters[w];
      const R = sitters[r];
      if (head) openChips();
      else begin(s, c, i);
      const lead = Math.max(300, 850 - head);
      const late = head + lead - 850;
      await s.wait(lead);
      // a wrong guess: up off the bench, hand up
      await hopUp(c, W);
      say(c, W, D.wrong);
      bg(W.wave(1250));
      bg(react(s, c, w));
      bg(
         s
            .wait(500)
            .then(() =>
               i % 2
                  ? him.nudge(-Math.round(him.h * 0.03), 900)
                  : him.wink(950),
            ),
      );
      await s.wait(Math.max(800, 1450 - late));
      // a beat after the last stroke: the right one jumps up, fists high,
      // and the wrong one deflates, sinking back onto the bench (seated
      // before the cheer reaches that seat, so it bounces along)
      const up = later(hopUp(c, R, 0.3, 440));
      await s.wait(300);
      solved(c, i, R);
      bg(sitDown(c, W));
      await up;
      if (i < LAST) await cheer(s, c, R); // the ending has its own cheer
      await settle(s, c);
      if (i === LAST) return;
      await s.wait(260);
      wipe();
      await s.wait(420);
   }
   // The cheer for the one who got it: seat-bounces ripple out from them
   // (fists up), anyone else off the bench waves, the winner jumps again
   // and he waves from the board.
   async function cheer(s: Stage, c: Company, hero: Actor): Promise<void> {
      bg(
         hero.jump({
            height: lift(c, hero, hero.h * 0.22, hero.y, hero.mode !== "stand"),
            air: 400,
         }),
      );
      bg(s.wait(200).then(() => c.him.wave(1300)));
      await s.ripple(
         c.sitters.filter((a) => a !== hero),
         (a) => (a.mode === "stand" ? a.wave(1000) : pop(c, a)),
         { from: seatOf(c, hero), step: 85 },
      );
      await s.wait(200);
   }
   // Everyone off the bench hops back onto it, a beat apart.
   const settle = (s: Stage, c: Company): Promise<Actor[]> =>
      s.together(
         c.sitters.filter((a) => a.mode === "stand"),
         (a, k) => s.wait(k * 150).then(() => sitDown(c, a)),
      );
   function solved(c: Company, i: number, R: Actor): void {
      guess = "solved";
      strike();
      say(c, R, doodles[i].right, "pn-say-ok");
      lockAnswers(true);
   }
   function wipe(): void {
      board.clear();
      unsay(false);
   }

   // The reader beat the row to it.
   async function visitorWins(s: Stage, c: Company, i: number): Promise<void> {
      const { you, sitters } = c;
      board.finish();
      strike();
      const up = later(hopUp(c, you, 0.32, 440));
      bg(c.him.wink(1100));
      // anyone still up with a wrong guess sinks back onto the bench
      for (const a of sitters)
         if (a !== you && a.mode === "stand") bg(sitDown(c, a));
      await s.wait(300);
      say(c, you, doodles[i].right, "pn-say-ok");
      // While the visitor is in the air the row turns to them, outward from
      // their seat (a mirror and a quick squash), so the cheer can start
      // the moment they land: no standing about in front of the bench.
      const row = sitters.filter((a) => a !== you);
      const side = (a: Actor): number =>
         Math.sign(seatOf(c, you) - seatOf(c, a));
      const lean = i === LAST; // no cheer follows the last one: they lean in instead
      const turn = later(
         s.ripple(
            row,
            (a) =>
               a
                  .face(side(a) > 0 ? "right" : "left")
                  .then(() =>
                     lean ? a.nudge(side(a) * Math.round(a.h * 0.085), 820) : a,
                  ),
            { from: seatOf(c, you), step: 60, jitter: 30 },
         ),
      );
      await up;
      if (i < LAST) await cheer(s, c, you);
      else await s.wait(500); // the ending has its own cheer
      await turn;
      await Promise.all([
         s.together(row, (a) => a.face("right")),
         settle(s, c),
      ]);
      if (i === LAST) return;
      await s.wait(260);
      wipe();
      await s.wait(420);
   }

   /* Where the envelope goes down to the control: left of every player, of
      the control and of the end line's words, so it crosses nobody. On a
      phone the row sits near the screen's edge, so it goes down the margin,
      smaller. */
   function laneFor(c: Company, target: DOMRect): Lane {
      const frameW = c.stage.troupe.size[0];
      let left = target.left;
      for (const a of [c.him, ...c.sitters]) {
         const bbox = a.member.frames[a.frame]?.bbox;
         const r = a.parts.sprite.getBoundingClientRect();
         if (!bbox || !r.width || a.el.style.opacity === "0") continue;
         const from = a.flip ? frameW - bbox[2] : bbox[0];
         left = Math.min(left, r.left + (from / frameW) * r.width);
      }
      // The shell's end line (between the stage and the control): its
      // words' box starts at the leftmost word.
      const line = ctx.endLine.rect();
      if (line) left = Math.min(left, line.left);
      const landing = target.height * 0.5;
      const room = left - LANE_EDGE;
      const gap = clamp(room - landing, LANE_TIGHT, LANE_GAP);
      const w = clamp(room - gap, LANE_MIN, landing);
      return { x: Math.max(LANE_EDGE + w / 2, left - gap - w / 2), w };
   }

   async function ending(s: Stage, c: Company): Promise<void> {
      lockAnswers(false);
      // To the shell's email control, when it is laid out; else the
      // envelope just wipes off.
      const target = ctx.email.rect();
      const flown = target ? board.fly(target, laneFor(c, target)) : 0;
      if (flown) await s.wait(flown);
      else {
         board.clear();
         await s.wait(320);
      }
      unsay(false);
      if (flown) ctx.email.arrive();
      // the whole row jumps together once: one air time, one landing
      bg(c.him.jump({ height: Math.round(c.him.h * 0.14), air: 460 }));
      await s.together(c.sitters, (a) => pop(c, a, 0.24, 460));
      board.showRecap(false);
      showReplay();
      await s.wait(600);
      await c.him.wave(1500);
      await s.wait(400);
   }

   async function rounds(
      s: Stage,
      c: Company,
      from: number,
      head = 0,
   ): Promise<void> {
      for (let i = from; i <= LAST; i++)
         await round(s, c, i, i === from ? head : 0);
      await ending(s, c);
      rest();
   }
   const run = (c: Company, show: (s: Stage) => Promise<void>): void =>
      bg(c.stage.play(show, { loop: false }));

   function showReplay(): void {
      // a guess or a pause made from the keyboard keeps its place
      const focused = [...ansBtns, pauseBtn].some(
         (b) => b === document.activeElement,
      );
      // from here "play again" answers at once (the draft made a press wait
      // for his last wave to end)
      phase = "outro";
      root.dataset.phase = phase;
      answers.dataset.mode = "replay";
      delete answers.dataset.open;
      pauseBtn.hidden = true;
      if (focused) replayBtn.focus({ preventScroll: true });
      fx.run(answers, [{ opacity: 0 }, { opacity: 1 }], {
         duration: 320,
         easing: EASE_STD,
      });
   }

   /* ---- rest, doze, replay ---- */
   function rest(): void {
      phase = "rest";
      root.dataset.phase = phase;
      hostHit.hidden = false;
      sync(); // breathing holds too: 0 running animations
      armDoze();
   }
   // At rest the stage is held; this lets it run for one bit of business
   // (the doze, his thank-you wink), then holds it again.
   async function awake(fn: () => Promise<unknown>): Promise<void> {
      waking++;
      sync();
      try {
         await fn();
      } catch (e) {
         if (e !== STOPPED) console.error(e);
      } finally {
         waking--;
         sync();
      }
   }
   // Held while the scene is hidden: the 25 s start again when it is back.
   function armDoze(): void {
      clearTimeout(dozeTimer);
      const c = co;
      if (!c || phase !== "rest" || dozed || !visible || userPaused) return;
      dozeTimer = window.setTimeout(() => {
         dozed = true;
         const [a, b] = c.L.doze.map((k) => c.sitters[k]);
         void awake(async () => {
            bg(a.sleep());
            await c.stage.wait(900);
            await b.sleep();
            await c.stage.wait(1500);
         });
      }, DOZE_MS);
   }
   // The first time the visitor copies or slides to his email, he winks.
   function thank(): void {
      const c = co;
      if (!c || thanked || !visible || userPaused) return;
      if (phase === "pre" || phase === "still") return;
      thanked = true;
      void awake(() => c.him.wink(1000));
   }
   function replay(): void {
      const c = co;
      if (!c || reduced || (phase !== "rest" && phase !== "outro")) return;
      const active = document.activeElement;
      const focused = active === replayBtn || active === hostHit;
      clearTimeout(dozeTimer);
      phase = "play";
      root.dataset.phase = phase;
      dozed = false;
      pauseBtn.hidden = false;
      hostHit.hidden = true;
      board.reset();
      ctx.email.underline(false);
      // the chips are back before the first doodle, shut until it starts
      setAnswers(0, true);
      shutChips();
      sync();
      run(c, async (s) => {
         await s.together(
            c.sitters.filter((a) => a.mode === "sleep"),
            (a) => a.wake(),
         );
         await rounds(s, c, 0);
      });
      if (focused) ansBtns[0].focus({ preventScroll: true });
   }
   hostHit.addEventListener("click", replay);

   /* ---- the reader's guesses ---- */
   function visitorRight(b: HTMLButtonElement): void {
      b.classList.add("pn-ok");
      lockAnswers(false);
      announce(copy.right, b.textContent);
      const c = co;
      if (!c || reduced) return;
      const i = doodleNow;
      guess = "solved";
      run(c, async (s) => {
         await visitorWins(s, c, i);
         if (i === LAST) {
            await ending(s, c);
            rest();
         } else await rounds(s, c, i + 1);
      });
   }
   function visitorWrong(b: HTMLButtonElement): void {
      announce(copy.wrong, b.textContent);
      const c = co;
      if (!c || reduced) {
         b.classList.add("pn-nope");
         return;
      }
      fx.run(
         b,
         [0, -6, 5, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
         { duration: 380, easing: EASE_STD },
      );
      // the visitor shrugs it off with a small weight shift
      const { you } = c;
      if (you.mode === "sit")
         bg(
            you.nudge(
               Math.round(you.h * 0.045) * (b === ansBtns[0] ? -1 : 1),
               700,
            ),
         );
   }
   answers.addEventListener("click", (e) => {
      const b = e.target instanceof Element ? e.target.closest("button") : null;
      if (!b) return;
      if (b === replayBtn) {
         replay();
         return;
      }
      if (b.getAttribute("aria-disabled") === "true") return;
      if (!reduced) {
         if (phase !== "play" || guess !== "open") return;
         if (userPaused) setUserPaused(false);
      }
      if (b.dataset.right) visitorRight(b);
      else visitorWrong(b);
   });

   /* ---- running, pausing, Reduced ---- */
   // Runs when on screen and not paused by the visitor; at rest only the
   // board's last fades and a bit of business (awake) may run.
   function sync(): void {
      const c = co;
      if (dead || !c) return;
      const hold = !visible || userPaused || reduced;
      const atRest = phase === "rest" && waking === 0;
      if (hold || atRest) c.stage.pause();
      if (hold) fx.pause();
      else {
         fx.resume();
         if (!atRest) c.stage.resume();
      }
   }
   function setUserPaused(p: boolean): void {
      userPaused = p;
      pauseBtn.toggleAttribute("data-paused", p);
      pauseBtn.setAttribute("aria-label", p ? copy.resume : copy.pause);
      // a held envelope would hang over the page as it scrolls
      if (p) board.land();
      sync();
      armDoze();
   }
   pauseBtn.addEventListener("click", () => setUserPaused(!userPaused));

   function launch(): void {
      const c = co;
      if (!c || c.art.status !== "ready" || phase !== "pre") return;
      if (reduced || !visible || !seen) return;
      phase = "play";
      root.dataset.phase = phase;
      sync();
      run(c, async (s) => rounds(s, c, 0, await entrance(s, c)));
   }
   // The scene before anyone arrives: the board and the bench, nobody yet.
   function pre(c: Company): void {
      c.stage.stop();
      clearTimeout(dozeTimer);
      phase = "pre";
      root.dataset.phase = phase;
      dozed = false;
      board.reset();
      ctx.email.underline(false);
      unsay(true);
      fx.clear();
      setAnswers(0, false);
      shutChips(); // the chips open once everyone is in
      pauseBtn.hidden = false;
      hostHit.hidden = true;
      // the visitor's pause outlasts a rebuild: only a press clears it
      offstage(c);
   }
   /* Reduced: the cloud drawn, one wrong guess struck through, the right
      one in blue, one player up with fists high, him waving. */
   function still(c: Company): void {
      pre(c);
      phase = "still";
      root.dataset.phase = phase;
      board.still(0);
      seatAll(c);
      const [w, r] = c.L.plan[0];
      const R = c.sitters[r];
      R.set({ y: 0, pose: "jump", z: STAND_Z });
      c.him.set({ pose: "wave" });
      say(c, c.sitters[w], doodles[0].wrong, "pn-say-x", true);
      say(c, R, doodles[0].right, "pn-say-ok");
      for (const b of ansBtns) if (b.dataset.right) b.classList.add("pn-shown");
      pauseBtn.hidden = true;
      // the draft's still has the end line's word underlined
      ctx.email.underline(true);
   }
   // The motion preference, applied to the company on stage.
   function compose(c: Company): void {
      c.stage.reduced(reduced); // Reduced stops the show; every move lands at once
      if (reduced) still(c);
      else pre(c);
      sync();
      launch();
   }
   // Loads and decodes the strips, then tells the shell the first frame is
   // in place (once) and starts the show if the stage is on screen.
   function load(c: Company): void {
      const done = (art: LoadState<number>): void => {
         if (dead || co !== c) return;
         c.art = art;
         if (art.status === "ready") root.dataset.cast = String(art.data);
         if (!announced) {
            announced = true;
            ctx.ready();
         }
         launch();
      };
      c.stage.ready().then(
         () =>
            done({
               status: "ready",
               data: c.stage.actors.filter((a) => a.el.style.opacity !== "0")
                  .length,
            }),
         (e: unknown) => {
            console.error(e);
            done({ status: "error" });
         },
      );
   }

   /* ---- the stage: its size, and how much of it is on screen ---- */
   let stage: Stage | null = null;
   // A new breakpoint, or a much wider or narrower play area: rebuild and
   // start over. The stage's own width alone changes nothing on a desktop.
   const resize = new ResizeObserver(() => {
      if (dead || !stage) return;
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return;
      const L = narrowQuery.matches ? NARROW : WIDE;
      const was = co;
      if (
         was &&
         was.L === L &&
         was.height === h &&
         Math.abs(was.play - L.play(w)) < 24 &&
         Math.abs(was.g.edgeR - wings(L, w).edge) < 24
      )
         return;
      const c = build(stage, L, w, h);
      co = c;
      compose(c);
      load(c);
   });
   const inView = new IntersectionObserver(
      (entries) => {
         if (seen) return;
         seen = entries.some(
            (e) => e.isIntersecting && e.intersectionRatio >= LAUNCH_RATIO,
         );
         if (seen) launch();
      },
      { threshold: [0, LAUNCH_RATIO] },
   );
   bg(
      loadTroupe().then((troupe) => {
         if (dead) return;
         stage = troupe.stage(castEl);
         resize.observe(root);
         inView.observe(root);
      }),
   );

   return {
      setReduced(next) {
         if (dead || next === reduced) return;
         reduced = next;
         if (co) compose(co);
      },
      setVisible(next) {
         if (dead || next === visible) return;
         visible = next;
         // a held envelope would hang over the page as it scrolls
         if (!visible) board.land();
         sync();
         armDoze();
         launch();
      },
      email: {
         copied: thank,
         slideEnd: (sent) => {
            if (sent) thank();
         },
      },
      destroy() {
         if (dead) return;
         dead = true;
         resize.disconnect();
         inView.disconnect();
         clearTimeout(dozeTimer);
         stage?.destroy();
         board.reset();
         ctx.email.underline(false);
         fx.clear();
         co = null;
         root.remove();
      },
   };
};
