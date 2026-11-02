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

/** The one pointer that owns the current drag. */
interface Drag {
   id: number;
   x: number;
   y: number;
   /** False until a touch drag turns horizontal; mouse and pen move at once. */
   moving: boolean;
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
   const dragRef = useRef<Drag | null>(null);
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
      // Only the primary mouse button drags.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      // A second finger must not steal the drag from the first.
      if (dragRef.current) return;
      touchedRef.current = true;
      const touch = e.pointerType === "touch";
      dragRef.current = {
         id: e.pointerId,
         x: e.clientX,
         y: e.clientY,
         moving: !touch,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      // A touch that starts a vertical scroll must not nudge the divider, so
      // touch waits for its first horizontal move instead of jumping on down.
      if (!touch) moveTo(e.clientX);
   };

   const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.moving) {
         const dx = Math.abs(e.clientX - drag.x);
         const dy = Math.abs(e.clientY - drag.y);
         if (dx <= dy) return;
         dragRef.current = { ...drag, moving: true };
      }
      moveTo(e.clientX);
   };

   const stopDrag = (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerId === dragRef.current?.id) dragRef.current = null;
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
