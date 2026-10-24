import { use, useEffect, useRef, type CSSProperties } from "react";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   FRAMES,
   mk,
   setReducedMotion,
   tour as walk,
   type FigureHandle,
   type FigureModule,
   type FigureMount,
   type Frame,
   type Readout,
   type Tour,
} from "./stage";
import { inject } from "./styles";

interface HairlineFigureProps {
   /** The figure's engine, e.g. `mount` from src/figures/covers/diagram.ts. */
   mount: FigureMount;
   /** The slot's accent: the one bright stroke. */
   tint: string;
   /** Stops for the unseen pointer, in viewBox units; walked in Full mode only. */
   tour?: Tour;
   /** The viewBox, [w, h]; the svg letterboxes it into the slot. */
   frame?: Frame;
   /** Intensity, 0 to 1; each engine maps it to its own number. */
   value?: number;
}

/** Engines say `rest` at rest; on a card the word tells a visitor nothing, so the caption shows only while the figure answers. */
const shown = (text: string) => (text === "rest" ? "" : text);

/**
 * Mounts a hairline engine into a slot. The div fills its positioned parent
 * with the plate colour; the svg inside keeps the frame centred and
 * letterboxed. The corner read-out sits outside the svg. The site's motion
 * preference drives the kit (Reduced lands every tween at once and stops the
 * tour), never the OS setting.
 */
export default function HairlineFigure({
   mount,
   tint,
   tour,
   frame = FRAMES.hairline,
   value = 0.5,
}: Readonly<HairlineFigureProps>) {
   const stageRef = useRef<HTMLDivElement>(null);
   const readRef = useRef<HTMLSpanElement>(null);
   const handleRef = useRef<FigureHandle | null>(null);
   const valueRef = useRef(value);
   const { reducedMotion } = useMotionPreference();
   const [w, h] = frame;

   // Declared first, so the engine's first tick already sees the preference.
   useEffect(() => {
      setReducedMotion(reducedMotion);
   }, [reducedMotion]);

   useEffect(() => {
      const stage = stageRef.current;
      const caption = readRef.current;
      if (!stage || !caption) return;
      inject();
      const svg = mk("svg", {
         viewBox: `0 0 ${w} ${h}`,
         preserveAspectRatio: "xMidYMid meet",
         "aria-hidden": "true",
      });
      stage.appendChild(svg);
      let text: string | null = null;
      const read: Readout = {
         get textContent() {
            return text;
         },
         set textContent(next) {
            if (next === text) return;
            text = next;
            caption.textContent = shown(next ?? "");
         },
      };
      caption.textContent = "";
      const figure = mount(
         { stage, svg, read, frame: [w, h] },
         valueRef.current,
      );
      handleRef.current = figure;
      return () => {
         handleRef.current = null;
         figure.destroy();
         svg.remove();
      };
   }, [mount, w, h]);

   useEffect(() => {
      valueRef.current = value;
      handleRef.current?.set(value);
   }, [value]);

   useEffect(() => {
      const stage = stageRef.current;
      if (!stage || !tour || reducedMotion) return;
      return walk(stage, tour).stop;
   }, [tour, reducedMotion]);

   return (
      <div
         ref={stageRef}
         data-hairline=""
         aria-hidden="true"
         style={{ "--hairline-hi": tint } as CSSProperties}
      >
         <span ref={readRef} data-hairline-read="" />
      </div>
   );
}

type Loader = () => Promise<FigureModule>;
const loaded = new WeakMap<Loader, Promise<FigureModule>>();

/**
 * A figure whose module loads on first render, so a registry of sixty
 * figures stays out of the section's chunk. Suspends while loading: wrap it
 * in <Suspense>. `frame` is the surface's frame, used when the module does
 * not export its own.
 */
export function LazyHairlineFigure({
   load,
   frame,
   tint,
}: Readonly<{ load: Loader; frame: Frame; tint: string }>) {
   let pending = loaded.get(load);
   if (!pending) {
      pending = load();
      loaded.set(load, pending);
   }
   const figure = use(pending);
   return (
      <HairlineFigure
         mount={figure.mount}
         tour={figure.tour}
         frame={figure.frame ?? frame}
         tint={tint}
      />
   );
}
