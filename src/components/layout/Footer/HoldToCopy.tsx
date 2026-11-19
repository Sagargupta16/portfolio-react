import { useEffect, useRef } from "react";
import {
   animate,
   motion,
   useMotionValue,
   useTransform,
   type AnimationPlaybackControls,
} from "motion/react";
import { getUiCopy } from "@data/ui";
import useCopyFeedback, { type CopyResult } from "@hooks/useCopyFeedback";
import { fillTemplate } from "@utils/fillTemplate";
import type { FooterSceneEmailEvents } from "./scenes/types";

const COPY = getUiCopy().footer;

/* Desktop email control. A ring fills while the button is held: a press
   shorter than CLICK_MS copies at once, a press held until the ring fills
   copies then, and a longer press let go early copies nothing. Enter, Space
   and a screen reader's activation copy at once. Each step is reported to
   the footer scene on stage. */

const HOLD_MS = 650;
const CLICK_MS = 220;
const RING = 2 * Math.PI * 9;
const EMPTY = { duration: 0.2 };

const HOLD_LABEL: Record<CopyResult, string> = {
   copied: COPY.copied,
   failed: COPY.copy_failed,
};

interface HoldToCopyProps {
   email: string;
   events: FooterSceneEmailEvents;
}

const HoldToCopy = ({ email, events }: HoldToCopyProps) => {
   const progress = useMotionValue(0);
   const dashOffset = useTransform(progress, (p) => RING * (1 - p));
   // The full ring stays up while "copied" shows, and empties as it ends.
   const feedback = useCopyFeedback(1800, (ended) => {
      if (ended === "copied") progress.set(0);
   });
   const copied = feedback.state === "copied";
   const runRef = useRef<AnimationPlaybackControls | null>(null);
   // When the press under way began, or null with no press under way.
   const pressRef = useRef<number | null>(null);
   const eventsRef = useRef(events);

   useEffect(() => {
      eventsRef.current = events;
   });

   // Unmounted mid-press (the window crossed into the phone layout): the
   // scene heard holdStart, so it hears the press end.
   useEffect(
      () => () => {
         runRef.current?.stop();
         if (pressRef.current !== null) eventsRef.current.holdCancel?.();
      },
      [],
   );

   const copy = async (quick: boolean) => {
      runRef.current?.stop();
      runRef.current = animate(progress, 1, EMPTY);
      // A failed copy empties the ring at once, so the next press can retry,
      // and tells the scene nothing was copied.
      if ((await feedback.copy(email)) === "copied") events.copied?.(quick);
      else {
         runRef.current = animate(progress, 0, EMPTY);
         events.holdCancel?.();
      }
   };

   // The press ended before the ring filled: nothing is copied.
   const letGo = () => {
      if (pressRef.current === null) return;
      pressRef.current = null;
      runRef.current?.stop();
      runRef.current = animate(progress, 0, EMPTY);
      events.holdCancel?.();
   };

   const start = (e: React.PointerEvent) => {
      if (e.button !== 0 || copied) return;
      pressRef.current = performance.now();
      events.holdStart?.(HOLD_MS);
      runRef.current?.stop();
      runRef.current = animate(progress, 1, {
         duration: HOLD_MS / 1000,
         ease: "linear",
         onComplete: () => {
            if (pressRef.current === null) return;
            pressRef.current = null;
            void copy(false);
         },
      });
   };

   const end = () => {
      const began = pressRef.current;
      if (began === null) return;
      if (performance.now() - began >= CLICK_MS) {
         letGo();
         return;
      }
      pressRef.current = null;
      void copy(true);
   };

   return (
      <button
         type="button"
         className="hold-copy"
         // Pointer presses are handled above; a click with no pointer behind
         // it (detail 0) is a screen reader's activation.
         onClick={(e) => {
            if (e.detail === 0 && !copied) void copy(true);
         }}
         onPointerDown={start}
         onPointerUp={end}
         onPointerLeave={letGo}
         onPointerCancel={letGo}
         onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            // preventDefault stops the button's own click; a key press copies
            // at once, and repeats are ignored.
            e.preventDefault();
            if (e.repeat || copied) return;
            pressRef.current = null;
            void copy(true);
         }}
         onContextMenu={(e) => e.preventDefault()}
      >
         <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle
               cx="11"
               cy="11"
               r="9"
               fill="none"
               stroke="rgba(255,255,255,0.12)"
               strokeWidth="2"
            />
            <motion.circle
               className="hold-copy-ring"
               cx="11"
               cy="11"
               r="9"
               fill="none"
               stroke="var(--color-accent-blue-light)"
               strokeWidth="2"
               strokeLinecap="round"
               strokeDasharray={RING}
               style={{
                  strokeDashoffset: dashOffset,
                  rotate: -90,
                  originX: "50%",
                  originY: "50%",
               }}
            />
         </svg>
         <span aria-live="polite">
            {feedback.state === "idle"
               ? fillTemplate(COPY.hold_copy, { email })
               : HOLD_LABEL[feedback.state]}
         </span>
      </button>
   );
};

export default HoldToCopy;
