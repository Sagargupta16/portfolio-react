import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, usePresence } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import { useMascotSection, watchMascotSection } from "@utils/mascotState";
import frames from "@assets/brand/mascot-frames.webp";

/* Mini Sagar (8-frame comic-style sprite made from his photos) perches on the heading
   rule of whichever section is in view. When the section changes he crouches
   and leaps out of the old heading while the new one's copy drops in from
   above, squashes on landing, winks, and sits with his legs dangling over the
   rule. Hover or tap: he waves. 20 s without input: he dozes off, and any
   input wakes him with a wave. Reduced motion: he just sits, no hops. */

const FRAME = {
   idle: 0,
   wink: 1,
   crouch: 2,
   jump: 3,
   land: 4,
   wave: 5,
   sit: 6,
   sleep: 7,
} as const;
type Frame = keyof typeof FRAME;
const LAST_FRAME = 7;

/** Ground contact of each pose as a fraction of frame height: feet for the
    standing poses, the ledge for the sitting ones, so every pose meets the
    rule. Measured from the sprite. */
const GROUND: Record<Frame, number> = {
   idle: 0.995,
   wink: 0.995,
   crouch: 0.995,
   jump: 0.995,
   land: 0.918,
   wave: 0.952,
   sit: 0.584,
   sleep: 0.584,
};

const SLEEP_AFTER = 20_000;
const WAVE_FOR = 1100;
const DROP = -110;
const ACTIVITY = [
   "pointermove",
   "pointerdown",
   "keydown",
   "wheel",
   "touchstart",
];

const wait = (ms: number) =>
   new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
   });

const MascotSprite = () => {
   const [scope, animate] = useAnimate<HTMLDivElement>();
   const [isPresent, safeToRemove] = usePresence();
   const { reducedMotion } = useMotionPreference();
   const [frame, setFrame] = useState<Frame>(reducedMotion ? "sit" : "jump");
   const frameRef = useRef(frame);
   const busyRef = useRef(!reducedMotion);
   const leavingRef = useRef(false);

   const show = (next: Frame) => {
      frameRef.current = next;
      setFrame(next);
   };

   // Entrance: drop in, squash on landing, stand, wink, sit.
   useEffect(() => {
      if (reducedMotion) return;
      const gone = () => leavingRef.current;
      const run = async () => {
         await animate(
            scope.current,
            { y: [DROP, 0], opacity: [0, 1] },
            { duration: 0.42, ease: [0.55, 0, 1, 0.45] },
         );
         if (gone()) return;
         show("land");
         await animate(
            scope.current,
            { scaleX: [1, 1.14, 1], scaleY: [1, 0.84, 1] },
            { duration: 0.28 },
         );
         if (gone()) return;
         show("idle");
         await wait(320);
         if (gone()) return;
         show("wink");
         await wait(220);
         if (gone()) return;
         show("sit");
         busyRef.current = false;
      };
      void run();
   }, [animate, scope, reducedMotion]);

   // Exit: crouch, then leap up and out.
   useEffect(() => {
      if (isPresent) return;
      leavingRef.current = true;
      if (reducedMotion) {
         safeToRemove();
         return;
      }
      const run = async () => {
         show("crouch");
         await wait(120);
         show("jump");
         await animate(
            scope.current,
            { y: DROP, opacity: 0 },
            { duration: 0.32, ease: [0, 0.55, 0.45, 1] },
         );
         safeToRemove();
      };
      void run();
   }, [isPresent, safeToRemove, animate, scope, reducedMotion]);

   const wave = () => {
      if (reducedMotion || busyRef.current || leavingRef.current) return;
      busyRef.current = true;
      show("wave");
      void animate(
         scope.current,
         { scaleX: [1, 1.08, 0.96, 1], scaleY: [1, 0.9, 1.05, 1] },
         { duration: 0.45 },
      );
      void wait(WAVE_FOR).then(() => {
         if (leavingRef.current) return;
         show("sit");
         busyRef.current = false;
      });
   };
   const wakeUp = useEffectEvent(() => {
      show("sit");
      wave();
   });

   // Doze after SLEEP_AFTER ms without input; any input wakes him with a wave.
   useEffect(() => {
      if (reducedMotion) return;
      let timer = setTimeout(doze, SLEEP_AFTER);
      function doze() {
         if (frameRef.current === "sit") show("sleep");
      }
      const onActivity = () => {
         clearTimeout(timer);
         timer = setTimeout(doze, SLEEP_AFTER);
         if (frameRef.current === "sleep") wakeUp();
      };
      for (const type of ACTIVITY) {
         globalThis.addEventListener(type, onActivity, { passive: true });
      }
      return () => {
         clearTimeout(timer);
         for (const type of ACTIVITY) {
            globalThis.removeEventListener(type, onActivity);
         }
      };
   }, [reducedMotion]);

   return (
      <motion.div
         ref={scope}
         className="mascot"
         style={{ opacity: reducedMotion ? 1 : 0, originY: 1 }}
         onTap={wave}
         onHoverStart={wave}
      >
         <div
            className="mascot-frame"
            style={{
               backgroundImage: `url(${frames})`,
               backgroundPosition: `${(FRAME[frame] / LAST_FRAME) * 100}% 0`,
               top: `calc(var(--mascot-h) * -${GROUND[frame]})`,
            }}
         />
      </motion.div>
   );
};

interface MascotProps {
   sectionId: string;
}

const Mascot = ({ sectionId }: MascotProps) => {
   const active = useMascotSection() === sectionId;
   useEffect(() => watchMascotSection(sectionId), [sectionId]);

   return (
      <div className="mascot-perch" aria-hidden="true">
         <AnimatePresence>
            {active && <MascotSprite key={sectionId} />}
         </AnimatePresence>
      </div>
   );
};

export default Mascot;
