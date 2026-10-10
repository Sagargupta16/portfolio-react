import type { ComponentProps, CSSProperties, ReactNode } from "react";
import useMotionPreference from "@hooks/useMotionPreference";
import { Trace } from "@pages/projects/covers/kit/primitives";
import {
   NON_SCALING,
   STAGE_H,
   STAGE_W,
   W16,
   layer,
} from "@pages/projects/covers/kit/sceneTokens";
import type { Box } from "@pages/projects/covers/kit/sceneTokens";
import { BASE_GRADIENT } from "./sceneParts";

/*
 * Shell for the engagement scenes. The covers kit draws on a 320 x 200 stage
 * in a 16:10 slot; engagement slots run wider (16:9 and 2:1 banners, a
 * 140 px strip on phones), so the base gradient, texture and tint wash fill
 * the whole slot while the stage is letterboxed in its middle at 16:10. Kit
 * SVG, packets, pips and labels then keep one uniform coordinate space at
 * every slot shape.
 */

const root: CSSProperties = {
   ...layer,
   overflow: "hidden",
   background: BASE_GRADIENT,
   containerType: "size",
};

const stageBox: CSSProperties = {
   position: "absolute",
   left: "50%",
   top: "50%",
   width: `min(100cqw, ${(STAGE_W / STAGE_H) * 100}cqh)`,
   height: `min(100cqh, ${(STAGE_H / STAGE_W) * 100}cqw)`,
   transform: "translate(-50%, -50%)",
};

const svgBox: CSSProperties = { ...layer, width: "100%", height: "100%" };

interface FrameProps {
   tint: string;
   /* focal point of the tint wash in slot percent, as "x% y%" */
   focus: string;
   /* back texture from the kit (DOTS, GRID, RAILS or COLUMNS) */
   texture: CSSProperties;
   /* SVG content in stage units */
   stage: ReactNode;
   /* HTML front layer, positioned in stage percent */
   children?: ReactNode;
}

export const Frame = ({
   tint,
   focus,
   texture,
   stage,
   children,
}: Readonly<FrameProps>) => {
   const wash = `radial-gradient(circle at ${focus}, ${tint}1f, transparent 60%)`;
   return (
      <div aria-hidden="true" style={root}>
         <div style={{ ...layer, ...texture }} />
         <div style={{ ...layer, background: wash }} />
         <div style={stageBox}>
            <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} style={svgBox}>
               {stage}
            </svg>
            {children}
         </div>
      </div>
   );
};

/*
 * A kit Trace that sits out Reduced mode. Its pathLength runs on Motion's JS
 * frameloop, which the freeze cannot pause, and its rest frame is hidden
 * anyway, so leaving it out keeps the Reduced frame identical and truly
 * still.
 */
export const Draw = (props: Readonly<ComponentProps<typeof Trace>>) => {
   const { reducedMotion } = useMotionPreference();
   if (reducedMotion) return null;
   return <Trace {...props} />;
};

interface DashedProps {
   d: string;
   stroke?: string;
   dash?: string;
}

/* Static dashed hairline: a link not made yet, a baseline, a feedback edge. */
export const Dashed = ({
   d,
   stroke = W16,
   dash = "2 3",
}: Readonly<DashedProps>) => (
   <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeDasharray={dash}
      vectorEffect={NON_SCALING}
   />
);

/* Dashed outline of a slot that something fills during the loop. */
export const Slot = ({
   box: [x, y, w, h],
   rx = 3,
}: Readonly<{ box: Box; rx?: number }>) => (
   <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill="none"
      stroke={W16}
      strokeDasharray="2 2"
      vectorEffect={NON_SCALING}
   />
);
