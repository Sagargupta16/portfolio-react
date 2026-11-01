import { Suspense, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import usePauseOffscreen from "@hooks/usePauseOffscreen";
import useSceneClock from "@hooks/useSceneClock";
import type { EngagementSceneKey } from "@/types";
import { BASE_GRADIENT } from "@pages/projects/covers/kit/sceneTokens";
import { ENGAGEMENT_SCENES } from "./sceneRegistry";

interface EngagementSceneProps {
   scene: EngagementSceneKey;
   tint: string;
   /** Slot box: size, aspect ratio, radius, margins. */
   style: CSSProperties;
   /** Melt the bottom edge into the card body below a banner. */
   fade?: boolean;
}

// Same idea as ProjectCover: a scene mounts only while its slot sits within
// this distance of the viewport, so a long modal never runs every loop.
const MOUNT_MARGIN = "300px 0px";

/* Inside a dialog the slot scrolls in the dialog's own scroller, which clips
   it, so against the viewport the margin never applies there: a banner just
   below the dialog's edge would mount only once scrolled in. The margin is
   measured against that scroller instead; on the page the root stays the
   viewport. */
const SCROLLS = new Set(["auto", "scroll"]);
const dialogScroller = (slot: HTMLElement | null): Element | null => {
   const dialog = slot?.closest('[role="dialog"]');
   for (let el = slot?.parentElement; dialog && el; el = el.parentElement) {
      if (SCROLLS.has(getComputedStyle(el).overflowY)) return el;
      if (el === dialog) break;
   }
   return null;
};

/* Truthy on purpose (a falsy fallback renders ErrorBoundary's full panel): a
   failed scene chunk leaves the slot's own sized, gradient-filled box empty
   instead of taking the whole Experience section down with it. */
const SCENE_FAILED = <></>;

const BOTTOM_FADE: CSSProperties = {
   position: "absolute",
   inset: 0,
   pointerEvents: "none",
   background:
      "linear-gradient(180deg, transparent 72%, rgb(14 20 23 / 0.85) 100%)",
};

/**
 * Decorative slot for an engagement scene: lazy, mounted near the viewport,
 * paused while the slot itself is out of view, frozen on its rest frame in
 * Reduced mode and restarted when Full returns.
 */
const EngagementScene = ({
   scene,
   tint,
   style,
   fade = false,
}: Readonly<EngagementSceneProps>) => {
   const slotRef = useRef<HTMLDivElement>(null);
   const scrollerRef = useRef<Element | null>(null);
   // Layout effects run before useInView's observer effect reads the root.
   useLayoutEffect(() => {
      scrollerRef.current = dialogScroller(slotRef.current);
   }, []);
   const nearViewport = useInView(slotRef, {
      root: scrollerRef,
      margin: MOUNT_MARGIN,
   });
   const { preference } = useMotionPreference();
   useFreezeAnimations(slotRef);
   usePauseOffscreen(slotRef);
   useSceneClock(slotRef);
   const Scene = ENGAGEMENT_SCENES[scene];

   return (
      <div
         ref={slotRef}
         aria-hidden="true"
         data-engagement-scene={scene}
         style={{
            position: "relative",
            overflow: "hidden",
            // the scene's own base, so mounting is seamless
            background: BASE_GRADIENT,
            ...style,
         }}
      >
         {nearViewport && (
            <ErrorBoundary fallback={SCENE_FAILED}>
               <Suspense fallback={null}>
                  <Scene key={preference} tint={tint} />
               </Suspense>
            </ErrorBoundary>
         )}
         {fade && <div style={BOTTOM_FADE} />}
      </div>
   );
};

export default EngagementScene;
