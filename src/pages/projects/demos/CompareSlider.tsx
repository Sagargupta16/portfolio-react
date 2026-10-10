import {
   useEffect,
   useRef,
   useState,
   type CSSProperties,
   type KeyboardEvent,
   type PointerEvent,
   type ReactNode,
} from "react";
import { animate, useInView } from "motion/react";
import { ChevronsLeftRight } from "lucide-react";
import useMotionPreference from "@hooks/useMotionPreference";

interface CompareSliderProps {
   before: ReactNode;
   after: ReactNode;
   /** Names the slider for screen readers. */
   label: string;
   accent: string;
}

const KEY_STEP = 5;
const START_POS = 50;
// One gentle sweep on first view hints that the divider can be dragged.
const HINT_KEYFRAMES = [START_POS, 30, 70, START_POS];

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Before/after comparison. The After layer sits on top, clipped from the
 * left at --pos; dragging the 44px handle (or using the arrow keys) moves
 * the divider. touch-action: pan-y keeps vertical page scroll on phones.
 */
const CompareSlider = ({
   before,
   after,
   label,
   accent,
}: CompareSliderProps) => {
   const { reducedMotion } = useMotionPreference();
   const frameRef = useRef<HTMLDivElement>(null);
   const draggingRef = useRef(false);
   const touchedRef = useRef(false);
   const inView = useInView(frameRef, { once: true, amount: 0.6 });
   const [pos, setPos] = useState(START_POS);

   useEffect(() => {
      if (!inView || reducedMotion || touchedRef.current) return;
      const controls = animate(START_POS, HINT_KEYFRAMES, {
         duration: 2.4,
         delay: 0.3,
         ease: "easeInOut",
         onUpdate: (v) => {
            if (!touchedRef.current) setPos(v);
         },
      });
      return () => controls.stop();
   }, [inView, reducedMotion]);

   const moveTo = (clientX: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      if (rect.width === 0) return;
      setPos(clamp(((clientX - rect.left) / rect.width) * 100));
   };

   const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      touchedRef.current = true;
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
   };

   const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
      if (draggingRef.current) moveTo(e.clientX);
   };

   const stopDrag = () => {
      draggingRef.current = false;
   };

   const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      let next: number | null = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos - KEY_STEP;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp")
         next = pos + KEY_STEP;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      if (next === null) return;
      e.preventDefault();
      touchedRef.current = true;
      setPos(clamp(next));
   };

   const rounded = Math.round(pos);

   return (
      <div
         ref={frameRef}
         className="compare-slider"
         style={
            {
               "--pos": `${pos}%`,
               "--compare-accent": accent,
            } as CSSProperties
         }
         onPointerDown={onPointerDown}
         onPointerMove={onPointerMove}
         onPointerUp={stopDrag}
         onPointerCancel={stopDrag}
      >
         <div className="compare-layer">{before}</div>
         <div className="compare-layer compare-layer--top">{after}</div>

         <div
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rounded}
            aria-valuetext={`${100 - rounded}% after, ${rounded}% before`}
            aria-orientation="horizontal"
            className="compare-handle"
            onKeyDown={onKeyDown}
         >
            <span className="compare-knob" aria-hidden="true">
               <ChevronsLeftRight size={16} />
            </span>
         </div>
      </div>
   );
};

export default CompareSlider;
