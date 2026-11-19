import { useEffect, useRef, type RefObject } from "react";
import { getName, getTimezone } from "@data/personal";
import { getUiCopy } from "@data/ui";
import { watchVisibility } from "@hooks/usePauseOffscreen";
import useMotionPreference from "@hooks/useMotionPreference";
import { fillTemplate, type TemplateValues } from "@utils/fillTemplate";
import { LOADING, type LoadState } from "@/types/loadState";
import { FOOTER_SCENES } from "./scenes/registry";
import type {
   FooterSceneContext,
   FooterSceneEmailEvents,
   FooterSceneHandle,
   FooterSceneId,
} from "./scenes/types";

/* The footer's stage: it loads the chosen scene's chunk once the footer is
   about a screen away, mounts it into a .footer-scene element and keeps it
   told about the motion preference and whether it can be seen. A new choice
   keeps the old scene on stage, held still, until the new one is ready (or
   READY_TIMEOUT_MS pass), then the two trade places. */

const SCENES = getUiCopy().footer.scenes;
const NAME = getName();
const FIRST_NAME = NAME.split(" ")[0];

// Load a screen ahead; play only while some of the stage is in view.
const LOAD_MARGIN = "100% 0px";
const VIEW_MARGIN = "0px";
const READY_TIMEOUT_MS = 4000;
const SWAP_MS = 420;
const FADE_IN_MS = 360;
const SHIFT_PX = 28;
// --ease-standard
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
// --ease-cinematic, and --ease-draw for the underline
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_DRAW = "cubic-bezier(0.65, 0, 0.35, 1)";
// A landing (ctx.email.arrive): the control's border lights for LIT_MS
// (fading LIT_FADE_MS each way), the knob or the ring answers, and the end
// line's accent word gets its underline in LINE_MS.
const LIT = "rgb(var(--ch-blue-light) / 0.7)";
const LIT_MS = 1400;
const LIT_FADE_MS = 300;
const KNOB_MS = 520;
const RING_MS = 1500;
const LINE_MS = 560;
const LINE_HIDDEN = "inset(0 100% 0 0)";
const LINE_SHOWN = "inset(0 0 0 0)";
// Border colour, clip-path and stroke-dashoffset are paint: they change at
// most this many times a second, whatever the display's rate.
const PAINT_FPS = 60;
const paintSteps = (ms: number) =>
   `steps(${Math.max(1, Math.round((ms * PAINT_FPS) / 1000))}, end)`;
// A clearly sideways swipe: this far across, and mostly across.
const SWIPE_PX = 48;
const SWIPE_SLOPE = 1.5;

export type SceneStep = 1 | -1;

/* {name} and {first_name} are the shell's to fill; any other placeholder
   ({answer}) stays in place for the scene. */
const fillNames = <T,>(value: T): T => {
   if (typeof value === "string") {
      const keep: TemplateValues = Object.fromEntries(
         [...value.matchAll(/\{(\w+)\}/g)].map(([token, key]) => [key, token]),
      );
      return fillTemplate(value, {
         ...keep,
         name: NAME,
         first_name: FIRST_NAME,
      }) as T;
   }
   if (value && typeof value === "object") {
      return Object.fromEntries(
         Object.entries(value).map(([key, entry]) => [key, fillNames(entry)]),
      ) as T;
   }
   return value;
};

/* One scene on the stage. `state` is how far it got: its chunk is loading,
   it is mounted, or it has called ready(). */
interface Slot {
   id: FooterSceneId;
   el: HTMLElement;
   step: SceneStep;
   state: "loading" | "mounted" | "ready";
   handle: FooterSceneHandle | null;
   anim: Animation | null;
}

interface StageOptions {
   reduced: boolean;
   emailRef: RefObject<HTMLElement | null>;
   underlineRef: RefObject<HTMLElement | null>;
   sceneEmailRef: RefObject<FooterSceneEmailEvents | undefined>;
   onLoad: (state: LoadState<FooterSceneId>) => void;
}

const createStage = (stage: HTMLElement, options: StageOptions) => {
   const { emailRef, underlineRef, sceneEmailRef, onLoad } = options;
   let reduced = options.reduced;
   let near = false;
   // Some of the stage is in the viewport; that, and the tab is showing.
   let inView = false;
   let visible = false;
   let wanted: { id: FooterSceneId; step: SceneStep } | null = null;
   // On stage and shown; waiting to replace it; on its way out.
   let current: Slot | null = null;
   let pending: Slot | null = null;
   let leaving: Slot | null = null;
   let readyTimer = 0;
   // The scene whose underline is up (it shows only while that scene is the
   // one on stage), and the animations of the last landing.
   let lineBy: Slot | null = null;
   let lineAnim: Animation | null = null;
   let litAnims: Animation[] = [];

   const control = () =>
      emailRef.current?.querySelector<HTMLElement>(
         ".hold-copy, .slide-contact",
      ) ?? null;
   const email = {
      rect: () => {
         const rect = control()?.getBoundingClientRect();
         return rect && (rect.width || rect.height) ? rect : null;
      },
      pulse: () => {
         if (reduced) return;
         control()?.animate(
            [
               { transform: "scale(1)" },
               { transform: "scale(1.04)" },
               { transform: "scale(1)" },
            ],
            { duration: 320, easing: EASE },
         );
      },
   };

   const endLine: FooterSceneContext["endLine"] = {
      rect: () => {
         const line = underlineRef.current?.closest(".footer-end-line");
         if (!line) return null;
         const words = document.createRange();
         words.selectNodeContents(line);
         const rect = words.getBoundingClientRect();
         return rect.width || rect.height ? rect : null;
      },
   };

   const calmControl = () => {
      for (const anim of litAnims) anim.cancel();
      litAnims = [];
   };
   const showLine = (by: Slot | null) => {
      lineBy = by;
      lineAnim?.cancel();
      lineAnim = null;
      underlineRef.current?.toggleAttribute(
         "data-shown",
         by !== null && by === current,
      );
   };
   // Something of the scene on stage landed on the control. Every change
   // here is an animation that ends by itself, so nothing needs undoing;
   // only the underline stays (an attribute).
   const land = (slot: Slot) => {
      calmControl();
      const ctl = control();
      if (ctl) {
         const base = getComputedStyle(ctl).borderColor;
         const total = LIT_MS + LIT_FADE_MS;
         litAnims.push(
            reduced
               ? ctl.animate([{ borderColor: LIT }, { borderColor: LIT }], {
                    duration: LIT_MS,
                 })
               : ctl.animate(
                    [
                       { borderColor: base, easing: EASE },
                       { borderColor: LIT, offset: LIT_FADE_MS / total },
                       {
                          borderColor: LIT,
                          offset: LIT_MS / total,
                          easing: EASE,
                       },
                       { borderColor: base },
                    ],
                    { duration: total, easing: paintSteps(total) },
                 ),
         );
         const knob = ctl.querySelector(".slide-contact-knob");
         const ring = ctl.querySelector<SVGGeometryElement>(".hold-copy-ring");
         if (!reduced && knob)
            litAnims.push(
               knob.animate(
                  [
                     { scale: "1" },
                     { scale: "1.2", easing: EASE },
                     { scale: "1" },
                  ],
                  { duration: KNOB_MS, easing: EASE_OUT },
               ),
            );
         if (!reduced && ring) {
            // Draws full and empties again, from wherever it is.
            const empty = ring.getTotalLength();
            litAnims.push(
               ring.animate(
                  [
                     { strokeDashoffset: empty, easing: EASE },
                     { strokeDashoffset: 0, offset: 0.3 },
                     { strokeDashoffset: 0, offset: 0.7, easing: EASE },
                     { strokeDashoffset: empty },
                  ],
                  { duration: RING_MS, easing: paintSteps(RING_MS) },
               ),
            );
         }
      }
      showLine(slot);
      if (reduced) return;
      lineAnim =
         underlineRef.current?.animate(
            [
               { clipPath: LINE_HIDDEN, easing: EASE_DRAW },
               { clipPath: LINE_SHOWN },
            ],
            { duration: LINE_MS, easing: paintSteps(LINE_MS) },
         ) ?? null;
   };
   // A scene's own view of the control: calls from a scene that has left
   // the stage do nothing.
   const emailFor = (slot: Slot): FooterSceneContext["email"] => ({
      ...email,
      arrive: () => {
         if (slot === current) land(slot);
      },
      underline: (shown) => {
         if (shown && (slot === current || slot === pending)) showLine(slot);
         else if (!shown && lineBy === slot) showLine(null);
      },
   });

   const remove = (slot: Slot | null) => {
      if (!slot) return;
      slot.anim?.cancel();
      slot.handle?.destroy();
      slot.el.remove();
      if (lineBy === slot) showLine(null);
   };
   const finishLeaving = () => {
      remove(leaving);
      leaving = null;
   };
   const report = (slot: Slot) =>
      onLoad(
         slot.state === "ready" ? { status: "ready", data: slot.id } : LOADING,
      );

   const commit = (slot: Slot) => {
      if (slot !== pending) return;
      window.clearTimeout(readyTimer);
      pending = null;
      const old = current;
      current = slot;
      // The old scene's landing and underline go with it; an underline the
      // new one asked for while it waited shows now.
      if (old) calmControl();
      showLine(lineBy === slot ? slot : null);
      sceneEmailRef.current = slot.handle?.email;
      slot.el.removeAttribute("aria-hidden");
      slot.el.inert = false;
      slot.handle?.setVisible(visible);
      report(slot);
      finishLeaving();
      if (old) {
         old.el.setAttribute("aria-hidden", "true");
         old.el.inert = true;
         leaving = old;
      }
      if (reduced) {
         slot.el.style.opacity = "";
         finishLeaving();
         return;
      }
      const shift = `translateX(${slot.step * SHIFT_PX}px)`;
      slot.el.style.opacity = "";
      slot.anim = slot.el.animate(
         old
            ? [
                 { opacity: 0, transform: shift },
                 { opacity: 1, transform: "none" },
              ]
            : [{ opacity: 0 }, { opacity: 1 }],
         { duration: old ? SWAP_MS : FADE_IN_MS, easing: EASE },
      );
      if (!old) return;
      // From wherever it is now, in case it was still coming in.
      if (old.anim?.playState === "running") old.anim.commitStyles();
      old.anim?.cancel();
      old.anim = old.el.animate(
         {
            opacity: 0,
            transform: `translateX(${-slot.step * SHIFT_PX}px)`,
         },
         { duration: SWAP_MS, easing: EASE, fill: "forwards" },
      );
      old.anim.onfinish = () => {
         if (leaving === old) finishLeaving();
      };
   };

   const contextFor = <Id extends FooterSceneId>(
      slot: Slot,
      id: Id,
   ): FooterSceneContext<Id> => ({
      reduced,
      copy: fillNames(SCENES[id]),
      name: NAME,
      firstName: FIRST_NAME,
      timeZone: getTimezone(),
      email: emailFor(slot),
      endLine,
      ready: () => {
         if (slot.state === "ready") return;
         if (slot === pending) {
            slot.state = "ready";
            // Called from inside mount: commit once mount has returned.
            if (slot.handle) commit(slot);
         } else if (slot === current) {
            slot.state = "ready";
            report(slot);
         }
      },
   });

   const mountInto = async <Id extends FooterSceneId>(slot: Slot, id: Id) => {
      const { mount } = await FOOTER_SCENES[id]();
      if (slot !== pending) return;
      slot.handle = mount(slot.el, contextFor(slot, id));
      // ready() may have come from inside mount.
      if (slot.state === "ready") {
         commit(slot);
         return;
      }
      slot.state = "mounted";
      slot.handle.setVisible(false);
      readyTimer = window.setTimeout(() => commit(slot), READY_TIMEOUT_MS);
   };

   const show = (id: FooterSceneId, step: SceneStep) => {
      wanted = { id, step };
      if (!near || pending?.id === id) return;
      window.clearTimeout(readyTimer);
      remove(pending);
      pending = null;
      if (current?.id === id) {
         // Back to the one on stage before the new one showed.
         current.handle?.setVisible(visible);
         report(current);
         return;
      }
      // At most the scene on stage and the one coming in.
      finishLeaving();
      current?.handle?.setVisible(false);

      const el = document.createElement("div");
      el.className = "footer-scene";
      el.dataset.scene = id;
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", fillNames(SCENES[id].label));
      // Until it takes the stage it is out of reach: no focus, no hits.
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
      el.style.opacity = "0";
      stage.append(el);
      const slot: Slot = {
         id,
         el,
         step,
         state: "loading",
         handle: null,
         anim: null,
      };
      pending = slot;
      onLoad(LOADING);
      mountInto(slot, id).catch(() => {
         // The chunk failed (offline, or a deploy replaced it): an empty
         // stage, and the rest of the footer keeps working. chunkReload.ts
         // does its one reload for a stale deploy.
         if (slot !== pending) return;
         pending = null;
         remove(slot);
         finishLeaving();
         remove(current);
         current = null;
         sceneEmailRef.current = undefined;
         onLoad({ status: "error" });
      });
   };

   const stopLoad = watchVisibility(stage, LOAD_MARGIN, (isNear) => {
      if (!isNear || near) return;
      near = true;
      if (wanted) show(wanted.id, wanted.step);
   });
   // A hidden tab counts as off screen: the sprite engine holds by itself,
   // and the scene's own animations and clocks must hold with it.
   const updateVisible = () => {
      visible = inView && !document.hidden;
      stage.toggleAttribute("data-offscreen", !visible);
      // A scene held for a swap stays held.
      if (!pending) current?.handle?.setVisible(visible);
   };
   const stopView = watchVisibility(stage, VIEW_MARGIN, (isVisible) => {
      inView = isVisible;
      updateVisible();
   });
   document.addEventListener("visibilitychange", updateVisible);

   return {
      show,
      setReduced: (next: boolean) => {
         reduced = next;
         current?.handle?.setReduced(next);
         pending?.handle?.setReduced(next);
         if (!next) return;
         // Reduced finishes a swap and a landing under way at once.
         current?.anim?.cancel();
         finishLeaving();
         lineAnim?.cancel();
         calmControl();
      },
      destroy: () => {
         stopLoad();
         stopView();
         document.removeEventListener("visibilitychange", updateVisible);
         window.clearTimeout(readyTimer);
         for (const slot of [pending, current, leaving]) remove(slot);
         pending = current = leaving = null;
         calmControl();
         showLine(null);
         sceneEmailRef.current = undefined;
         stage.removeAttribute("data-offscreen");
      },
   };
};

interface FooterStageProps {
   scene: FooterSceneId;
   /** The direction of the last change, for the swap's slide. */
   step: SceneStep;
   /** A sideways swipe on the stage (touch). */
   onStep: (step: SceneStep) => void;
   onLoad: (state: LoadState<FooterSceneId>) => void;
   /** Holds the email control, for ctx.email.rect(), pulse() and arrive(). */
   emailRef: RefObject<HTMLElement | null>;
   /** The end line accent word's underline, for arrive() and underline(). */
   underlineRef: RefObject<HTMLElement | null>;
   /** Set to the email events of the scene on stage. */
   sceneEmailRef: RefObject<FooterSceneEmailEvents | undefined>;
}

const FooterStage = ({
   scene,
   step,
   onStep,
   onLoad,
   emailRef,
   underlineRef,
   sceneEmailRef,
}: FooterStageProps) => {
   const stageRef = useRef<HTMLDivElement>(null);
   const controllerRef = useRef<ReturnType<typeof createStage> | null>(null);
   const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null);
   const { reducedMotion } = useMotionPreference();
   const reducedRef = useRef(reducedMotion);
   const onLoadRef = useRef(onLoad);

   useEffect(() => {
      reducedRef.current = reducedMotion;
      onLoadRef.current = onLoad;
   });

   useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const created = createStage(stage, {
         reduced: reducedRef.current,
         emailRef,
         underlineRef,
         sceneEmailRef,
         onLoad: (state) => onLoadRef.current(state),
      });
      controllerRef.current = created;
      return () => {
         created.destroy();
         controllerRef.current = null;
      };
   }, [emailRef, underlineRef, sceneEmailRef]);

   useEffect(() => {
      controllerRef.current?.show(scene, step);
   }, [scene, step]);

   useEffect(() => {
      controllerRef.current?.setReduced(reducedMotion);
   }, [reducedMotion]);

   return (
      <div
         ref={stageRef}
         className="footer-stage"
         onPointerDown={(e) => {
            if (e.pointerType !== "touch") return;
            swipeRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
         }}
         onPointerUp={(e) => {
            const start = swipeRef.current;
            swipeRef.current = null;
            if (!start || start.id !== e.pointerId) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (
               Math.abs(dx) >= SWIPE_PX &&
               Math.abs(dx) > Math.abs(dy) * SWIPE_SLOPE
            )
               onStep(dx < 0 ? 1 : -1);
         }}
         onPointerCancel={() => {
            swipeRef.current = null;
         }}
      />
   );
};

export default FooterStage;
