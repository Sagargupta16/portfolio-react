import { useId } from "react";
import { motion } from "motion/react";
import {
   AMBER,
   CYCLE,
   NON_SCALING,
   WHITE_05,
   WHITE_14,
   WHITE_22,
   WHITE_35,
   WHITE_55,
   curve,
   loop,
   vcurve,
   vcurvePoints,
} from "./sceneTokens";
import type { PipelineProps, Point } from "./sceneTokens";
import {
   CronGlyph,
   Label,
   Packet,
   Panel,
   Pop,
   Rule,
   SceneSvg,
   Wire,
} from "./primitives";

/* Instagram Autopilot (src/flows/carousel_flow.py): a scheduler tick asks
   Bedrock for five image prompts, Stable Image Ultra renders five portrait
   slides and one is content filtered, the survivors fly into one Instagram
   carousel that Composio publishes, and the post swipes through them.
   Reads as a Z: prompts top left, slides below them, the post on the right. */

/* Bedrock panel: header with the cron dial, then the five image prompts. */
const PANEL = { x: 136, y: 120, w: 420, h: 290 };
const HEADER_Y = PANEL.y + 46;
const PROMPT_X = PANEL.x + 44;
const PROMPT_TOP = PANEL.y + 108;
const PROMPT_PITCH = 38;
const PROMPT_WIDTHS = [330, 246, 296, 204, 268];

/* Five portrait 4:5 slides, the third one blocked by the content filter. */
const TILE_W = 104;
const TILE_H = 130;
const TILE_RX = 10;
const TILE_PITCH = 128;
const STRIP_X = 136;
const STRIP_MID = 590;
const TILE_TOP = STRIP_MID - TILE_H / 2;
const FILTERED_SLOT = 2;
const SURVIVORS = [0, 1, 3, 4];
/* Drawn last first, so the first flier passes over the slides still waiting. */
const DRAW_ORDER = [4, 3, 1, 0];
const slotX = (slot: number) => STRIP_X + slot * TILE_PITCH;

/* The post card: header, 4:5 image well, actions and pagination, caption. */
const POST = { x: 1104, y: 110, w: 360, h: 740 };
const POST_HEAD_Y = POST.y + 52;
const IMAGE = { x: 1120, y: 206, w: 328, h: 410 };
const IMAGE_MID_X = IMAGE.x + IMAGE.w / 2;
const IMAGE_MID_Y = IMAGE.y + IMAGE.h / 2;
const LAND_SCALE = IMAGE.w / TILE_W;
const ACTION_Y = IMAGE.y + IMAGE.h + 44;
const ACTION_XS = [IMAGE.x + 20, IMAGE.x + 60, IMAGE.x + 100];
const DOT_PITCH = 26;
const DOT_X0 = IMAGE_MID_X - (DOT_PITCH * (SURVIVORS.length - 1)) / 2;
const CAPTION = [
   { y: ACTION_Y + 52, w: 260, color: WHITE_35 },
   { y: ACTION_Y + 88, w: 290, color: WHITE_14 },
   { y: ACTION_Y + 124, w: 200, color: WHITE_14 },
];

/* Panel bottom down into the strip, then strip across to the post. */
const WIRE_IN: [Point, Point] = [
   [PANEL.x + PANEL.w / 2, PANEL.y + PANEL.h],
   [slotX(FILTERED_SLOT) + TILE_W / 2, TILE_TOP],
];
const WIRE_OUT: [Point, Point] = [
   [slotX(4) + TILE_W, STRIP_MID],
   [POST.x, IMAGE_MID_Y],
];

/* Beats, cycle seconds. */
const DEVELOP_AT = 1.55;
const DEVELOP_STAGGER = 0.2;
const FLY_AT = 2.75;
const FLY_STAGGER = 0.14;
const FLY_TIME = 0.55;
const POST_ON = FLY_AT + FLY_TIME;
const SWIPES = [4.1, 4.8];
const RESET = 5.35;

interface Box {
   x: number;
   y: number;
   w: number;
   h: number;
}

/* A tiny photo: sky, sun and a ridge, so a slide reads as an image. */
const Photo = ({ tint, x, y, w, h }: Box & { tint: string }) => (
   <>
      <rect x={x} y={y} width={w} height={h} rx={w / 10} fill={`${tint}24`} />
      <circle
         cx={x + w * 0.7}
         cy={y + h * 0.28}
         r={w * 0.09}
         fill={`${tint}66`}
      />
      <path
         d={`M${x} ${y + h} L${x} ${y + h * 0.74} L${x + w * 0.34} ${y + h * 0.56} L${x + w * 0.56} ${y + h * 0.72} L${x + w} ${y + h * 0.5} L${x + w} ${y + h} Z`}
         fill={`${tint}40`}
      />
   </>
);

/* The five image prompts type in as one group from the left. */
const Prompts = () => (
   <motion.g
      animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
      transition={loop(0, 0.25, 1, RESET, RESET + 0.4, CYCLE)}
      style={{ originX: 0 }}
   >
      {PROMPT_WIDTHS.map((w, i) => (
         <Rule
            key={w}
            x={PROMPT_X}
            y={PROMPT_TOP + i * PROMPT_PITCH}
            w={w}
            color={i === 0 ? WHITE_55 : WHITE_35}
         />
      ))}
   </motion.g>
);

/* One surviving slide: develops in place, then flies into the post and
   grows to fill its image well; at rest it waits dim as an empty slot. */
const Survivor = ({ tint, slot }: { tint: string; slot: number }) => {
   const x = slotX(slot);
   const develop = DEVELOP_AT + slot * DEVELOP_STAGGER;
   const fly = FLY_AT + SURVIVORS.indexOf(slot) * FLY_STAGGER;
   const land = fly + FLY_TIME;
   const dx = IMAGE_MID_X - (x + TILE_W / 2);
   const dy = IMAGE_MID_Y - STRIP_MID;
   const s = LAND_SCALE;
   return (
      <motion.g
         animate={{
            opacity: [0.16, 0.16, 1, 1, 1, 0, 0, 0, 0.16],
            x: [0, 0, 0, 0, dx, dx, 0, 0, 0],
            y: [0, 0, 0, 0, dy, dy, 0, 0, 0],
            scale: [0.92, 0.92, 1, 1, s, s, 0.92, 0.92, 0.92],
         }}
         transition={loop(
            0,
            develop,
            develop + 0.25,
            fly,
            land,
            land + 0.3,
            5.6,
            5.75,
            CYCLE,
         )}
      >
         <Photo tint={tint} x={x} y={TILE_TOP} w={TILE_W} h={TILE_H} />
         <rect
            x={x}
            y={TILE_TOP}
            width={TILE_W}
            height={TILE_H}
            rx={TILE_RX}
            fill="none"
            stroke={`${tint}80`}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      </motion.g>
   );
};

/* The filtered slide: an empty dashed slot that takes one amber flag. */
const FILTERED = {
   x: slotX(FILTERED_SLOT),
   y: TILE_TOP,
   width: TILE_W,
   height: TILE_H,
   rx: TILE_RX,
   fill: "none",
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Filtered = () => (
   <>
      <rect {...FILTERED} stroke={WHITE_22} strokeDasharray="4 4" />
      <motion.rect
         {...FILTERED}
         stroke={AMBER}
         animate={{
            opacity: [0, 0, 1, 0.4, 0.4, 0, 0],
            scale: [1, 1, 1.12, 1, 1, 1, 1],
         }}
         transition={loop(0, 1.95, 2.05, 2.6, RESET, RESET + 0.4, CYCLE)}
      />
   </>
);

/* Published post: the survivors as one strip behind the image clip, swiping
   twice while the active pagination dot follows. */
const SWIPE_X = [0, 0, -IMAGE.w, -IMAGE.w, -2 * IMAGE.w, -2 * IMAGE.w, 0, 0];
const SWIPE = loop(
   0,
   SWIPES[0],
   SWIPES[0] + 0.4,
   SWIPES[1],
   SWIPES[1] + 0.4,
   5.75,
   5.8,
   CYCLE,
);
const POST_FADE = loop(0, POST_ON, POST_ON + 0.2, RESET, 5.7, CYCLE);
const SHOWN = [0, 0, 1, 1, 0, 0];

const PostImage = ({ tint, clipId }: { tint: string; clipId: string }) => (
   <g clipPath={`url(#${clipId})`}>
      <motion.g
         animate={{ opacity: SHOWN, x: SWIPE_X }}
         transition={{ opacity: POST_FADE, x: SWIPE }}
      >
         {SURVIVORS.map((slot, i) => (
            <Photo
               key={slot}
               tint={tint}
               x={IMAGE.x + i * IMAGE.w}
               y={IMAGE.y}
               w={IMAGE.w}
               h={IMAGE.h}
            />
         ))}
      </motion.g>
   </g>
);

/* Like, comment and share on the left; the carousel dots centred. */
const ActionRow = () => (
   <>
      {ACTION_XS.map((cx) => (
         <circle
            key={cx}
            cx={cx}
            cy={ACTION_Y}
            r={10}
            fill="none"
            stroke={WHITE_35}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      {SURVIVORS.map((slot, i) => (
         <circle
            key={slot}
            cx={DOT_X0 + i * DOT_PITCH}
            cy={ACTION_Y}
            r={6}
            fill={WHITE_22}
         />
      ))}
      <motion.circle
         cx={DOT_X0}
         cy={ACTION_Y}
         r={6}
         fill={WHITE_55}
         animate={{
            opacity: SHOWN,
            x: SWIPE_X.map((v) => (-v / IMAGE.w) * DOT_PITCH),
         }}
         transition={{ opacity: POST_FADE, x: SWIPE }}
      />
   </>
);

/* Post frame: avatar and handle, the empty image well, the caption. */
const PostFrame = () => (
   <>
      <Panel {...POST} stroke={WHITE_14} />
      <circle
         cx={POST.x + 48}
         cy={POST_HEAD_Y}
         r={18}
         fill="none"
         stroke={WHITE_35}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <Rule x={POST.x + 82} y={POST_HEAD_Y} w={120} color={WHITE_35} />
      <rect
         x={IMAGE.x}
         y={IMAGE.y}
         width={IMAGE.w}
         height={IMAGE.h}
         rx={TILE_RX}
         fill={WHITE_05}
      />
      {CAPTION.map((line) => (
         <Rule
            key={line.y}
            x={IMAGE.x + 6}
            y={line.y}
            w={line.w}
            color={line.color}
         />
      ))}
   </>
);

const CarouselPipeline = ({ tint }: PipelineProps) => {
   const clipId = useId();
   const caption = `${tint}b3`;
   return (
      <>
         <SceneSvg>
            <defs>
               <clipPath id={clipId}>
                  <rect
                     x={IMAGE.x}
                     y={IMAGE.y}
                     width={IMAGE.w}
                     height={IMAGE.h}
                     rx={TILE_RX}
                  />
               </clipPath>
            </defs>
            <Wire d={vcurve(...WIRE_IN)} color={`${tint}40`} />
            <Wire d={curve(...WIRE_OUT)} color={`${tint}40`} />
            <Panel {...PANEL} />
            <Rule x={PANEL.x + 76} y={HEADER_Y} w={110} color={WHITE_22} />
            <Prompts />
            <Filtered />
            <PostFrame />
            <PostImage tint={tint} clipId={clipId} />
            <ActionRow />
            {DRAW_ORDER.map((slot) => (
               <Survivor key={slot} tint={tint} slot={slot} />
            ))}
         </SceneSvg>
         <CronGlyph tint={tint} x={PANEL.x + 44} y={HEADER_Y} />
         <Packet
            tint={tint}
            points={vcurvePoints(...WIRE_IN, 5)}
            from={1}
            to={1.5}
            heading="down"
         />
         <Pop x={POST.x + POST.w - 40} y={POST_HEAD_Y} at={3.6} until={RESET} />
         <Label x={PANEL.x} y={80} text="BEDROCK" color={caption} />
         <Label x={STRIP_X} y={488} text="CAROUSEL" color={caption} />
         <Label
            x={POST.x + POST.w}
            y={80}
            text="COMPOSIO"
            color={caption}
            align="end"
         />
      </>
   );
};

export default CarouselPipeline;
