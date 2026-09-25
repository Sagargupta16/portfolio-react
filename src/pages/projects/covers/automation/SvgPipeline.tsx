import { CENTER_Y, WHITE_35, caption } from "./sceneTokens";
import type { PipelineProps } from "./sceneTokens";
import {
   Hairline,
   PulseRing,
   STAGE_WIDTH,
   StageBox,
   SuccessDot,
   TravelDot,
} from "./primitives";

/* Shared skeleton for the SVG card actions: cron -> input stage -> render ->
   an output slot the variant draws into, committed back to the repo. The
   variant supplies what moves inside the first stage and the output slot. */

/* Cycle seconds shared by every variant's output, so the handoff dot lands
   exactly when the output starts drawing. */
export const DRAW_START = 3.1;
export const HOLD_END = 5.4;
export const FADE_END = 5.7;
export const RESET_AT = 5.75;

export const OUTPUT_WIDTH = 62;
export const OUTPUT_HEIGHT = 54;

const RENDER_LEFT_PCT = 52;
const OUTPUT_RIGHT = "8%";
/* Shortest handoff track; keeps the dot moving if the gap between the render
   box and the output ever closes on a narrow card. */
const MIN_HANDOFF_PX = 16;

/* The hairline and the handoff dot end at the output's left edge, and the
   handoff dot starts at the render box's right edge, at any card width. */
const OUTPUT_LEFT_EDGE = `calc(${OUTPUT_RIGHT} + ${OUTPUT_WIDTH}px)`;
const HANDOFF_LEFT = `calc(${RENDER_LEFT_PCT}% + ${STAGE_WIDTH}px)`;
const HANDOFF_WIDTH = `max(${MIN_HANDOFF_PX}px, calc(${100 - RENDER_LEFT_PCT}% - ${STAGE_WIDTH}px - ${OUTPUT_LEFT_EDGE}))`;

/* Static SVG frame glyph inside the render stage. */
const FrameGlyph = () => (
   <svg width="16" height="12" viewBox="0 0 16 12" style={{ display: "block" }}>
      <rect
         x="0.5"
         y="0.5"
         width="15"
         height="11"
         rx="2"
         stroke={WHITE_35}
         strokeWidth="1"
         fill="none"
      />
      <path d="M3,8 L6,5 L9,7 L13,3" stroke={WHITE_35} fill="none" />
   </svg>
);

const OutputSlot = ({
   tint,
   text,
   children,
}: {
   tint: string;
   text: string;
   children: React.ReactNode;
}) => (
   <div
      style={{
         position: "absolute",
         right: OUTPUT_RIGHT,
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div
         style={{
            position: "relative",
            width: OUTPUT_WIDTH,
            height: OUTPUT_HEIGHT,
         }}
      >
         {children}
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

interface SvgPipelineProps extends PipelineProps {
   input: React.ReactNode;
   output: React.ReactNode;
}

const SvgPipeline = ({ tint, stages, input, output }: SvgPipelineProps) => (
   <>
      <Hairline tint={tint} left="24%" right={OUTPUT_LEFT_EDGE} />
      <StageBox tint={tint} left="34%" text={stages[0]}>
         {input}
      </StageBox>
      <StageBox tint={tint} left={`${RENDER_LEFT_PCT}%`} text={stages[1]}>
         <FrameGlyph />
         <PulseRing tint={tint} at={2} />
      </StageBox>
      <TravelDot
         tint={tint}
         left="24%"
         width="30%"
         top="50%"
         from={0.1}
         to={2.1}
      />
      <TravelDot
         tint={tint}
         left={HANDOFF_LEFT}
         width={HANDOFF_WIDTH}
         top="50%"
         from={2.3}
         to={DRAW_START}
         size={4}
      />
      <OutputSlot tint={tint} text={stages[2]}>
         {output}
      </OutputSlot>
      <SuccessDot at={4.6} />
   </>
);

export default SvgPipeline;
