import { motion, type MotionStyle, type Variants } from "motion/react";
import { EASING } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import { VIEWPORT_MARGIN } from "@utils/animations";
import {
   DRAW_S,
   FIGURE_H,
   MARK,
   shapeKey,
   type Figure,
   type Part,
   type Shape,
} from "./tileFigures";
import { FIGURE_TONES } from "./statsTokens";

// Each part's variant takes its start time (seconds after the tile scrolls in)
// as `custom`. Opacity, transforms and pathLength only, played once; Reduced
// mounts every part at its end state.
const REVEAL: Record<Part["motion"], Variants> = {
   draw: {
      hidden: { pathLength: 0, opacity: 0 },
      visible: (at: number) => ({
         pathLength: 1,
         opacity: 1,
         transition: {
            pathLength: { delay: at, duration: DRAW_S, ease: "easeInOut" },
            opacity: { delay: at, duration: 0.01 },
         },
      }),
   },
   pop: {
      hidden: { opacity: 0, scale: 0.2 },
      visible: (at: number) => ({
         opacity: 1,
         scale: 1,
         transition: {
            opacity: { delay: at, duration: 0.2 },
            scale: { delay: at, duration: 0.45, ease: "backOut" },
         },
      }),
   },
   rise: {
      hidden: { opacity: 0, scaleY: 0 },
      visible: (at: number) => ({
         opacity: 1,
         scaleY: 1,
         transition: { delay: at, duration: 0.5, ease: EASING.cinematic },
      }),
   },
   fade: {
      hidden: { opacity: 0 },
      visible: (at: number) => ({
         opacity: 1,
         transition: { delay: at, duration: 0.35 },
      }),
   },
};

// Rising parts grow up from their own base (Motion gives SVG fill-box origins).
const RISE_ORIGIN: MotionStyle = { originY: 1 };

const ShapeEl = ({ shape }: Readonly<{ shape: Shape }>) => {
   const tone = FIGURE_TONES[shape.tone];
   switch (shape.kind) {
      case "circle":
         return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...tone} />;
      case "rect":
         return (
            <rect
               x={shape.x}
               y={shape.y}
               width={shape.w}
               height={shape.h}
               rx={shape.rx}
               {...tone}
            />
         );
      case "path":
         return <path d={shape.d} {...tone} />;
   }
};

interface StatFigureProps {
   /** Missing when the tile's number has no honest picture: shows MARK. */
   figure?: Figure;
   /** Seconds after the figure scrolls in before its first part starts. */
   delay: number;
   /** Rendered height in px; the width follows the figure's aspect. */
   height: number;
}

/** The small flat figure at the top of a Stats band tile. Decorative: the
 *  tile's number, label and note carry the content. */
const StatFigure = ({
   figure = MARK,
   delay,
   height,
}: Readonly<StatFigureProps>) => {
   const { reducedMotion } = useMotionPreference();

   // Keyed on the setting: `initial` is read once, so a switch to Reduced
   // before the tile scrolls in remounts the figure at its end state rather
   // than letting it reveal later. It holds no state to lose.
   return (
      <motion.svg
         key={reducedMotion ? "still" : "moving"}
         aria-hidden="true"
         focusable="false"
         viewBox={`0 0 ${figure.width} ${FIGURE_H}`}
         width={(figure.width * height) / FIGURE_H}
         height={height}
         initial={reducedMotion ? "visible" : "hidden"}
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         style={{ display: "block", overflow: "visible", marginBottom: 6 }}
      >
         {figure.parts.map((part) =>
            part.motion === "draw" ? (
               <motion.path
                  key={part.key}
                  d={part.d}
                  {...FIGURE_TONES[part.tone]}
                  variants={REVEAL.draw}
                  custom={delay + part.at}
               />
            ) : (
               <motion.g
                  key={part.key}
                  variants={REVEAL[part.motion]}
                  custom={delay + part.at}
                  style={part.motion === "rise" ? RISE_ORIGIN : undefined}
               >
                  {part.shapes.map((shape) => (
                     <ShapeEl key={shapeKey(shape)} shape={shape} />
                  ))}
               </motion.g>
            ),
         )}
      </motion.svg>
   );
};

export default StatFigure;
