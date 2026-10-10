import { useId } from "react";
import { motion } from "motion/react";
import {
   CYCLE,
   GREEN,
   NON_SCALING,
   PANEL_SOLID,
   WHITE_07,
   WHITE_22,
   WHITE_35,
   WHITE_55,
   loop,
} from "./sceneTokens";
import type { PipelineProps, Point } from "./sceneTokens";
import { Label, Panel, Rule, SceneSvg } from "./primitives";
import { QueryOverlay, QueryPanel } from "./QueryStage";

/* OSS Contributions Card Action (oss_contributions_card.py): two GraphQL
   searches, is:merged and is:open, refresh the merged and in review cards.
   As the README puts it, a pull request shows up when you open it and moves
   to the merged card when it lands: the open row lifts out of in review,
   takes the newest first slot, and its ring turns green. */

const MERGED = { x: 540, y: 110, w: 924, h: 390 };
const REVIEW = { x: 540, y: 540, w: 924, h: 260 };
/* Header strip of each card, above its first row. */
const HEAD_H = 72;
const TARGETS: Point[] = [
   [MERGED.x, MERGED.y + MERGED.h / 2],
   [REVIEW.x, REVIEW.y + REVIEW.h / 2],
];

/* One pull request row: status mark, repository, title, number. */
const ROW_X = 556;
const ROW_W = 892;
const ROW_H = 58;
const ROW_PITCH = 76;
const MARK_X = 592;
const MARK_R = 11;
const TEXT_X = 622;
const NUMBER_X = 1366;

interface PullRow {
   y: number;
   repo: number;
   title: number;
}

const MERGED_ROWS: PullRow[] = [
   { y: 220, repo: 196, title: 390 },
   { y: 296, repo: 156, title: 460 },
   { y: 372, repo: 220, title: 330 },
   { y: 448, repo: 176, title: 400 },
];
const LANDING: PullRow = { y: 652, repo: 176, title: 420 };
const OPEN_ROW: PullRow = { y: 728, repo: 146, title: 360 };
const RISE = MERGED_ROWS[0].y - LANDING.y;

/* Beats, cycle seconds. */
const LIFT_AT = 1.9;
const MOVE_AT = 2.1;
const MOVE_TO = 3;
const TURN_AT = 2.4;
const RESET = 5.2;

const RowBody = ({ row }: { row: PullRow }) => (
   <>
      <rect
         x={ROW_X}
         y={row.y - ROW_H / 2}
         width={ROW_W}
         height={ROW_H}
         rx={16}
         fill={PANEL_SOLID}
         stroke={WHITE_07}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <Rule x={TEXT_X} y={row.y} w={row.repo} color={WHITE_55} />
      <Rule
         x={TEXT_X + row.repo + 26}
         y={row.y}
         w={row.title}
         color={WHITE_22}
      />
      <Rule x={NUMBER_X} y={row.y} w={56} color={WHITE_35} />
   </>
);

/* In review rows carry a hollow ring, merged rows a green dot. */
const OpenMark = ({ y }: { y: number }) => (
   <circle
      cx={MARK_X}
      cy={y}
      r={MARK_R}
      fill="none"
      stroke={WHITE_55}
      strokeWidth={1}
      vectorEffect={NON_SCALING}
   />
);
const MergedMark = ({ y }: { y: number }) => (
   <circle cx={MARK_X} cy={y} r={MARK_R} fill={GREEN} />
);

/* Merged list, newest first: makes room for the new row, the oldest one
   drops past the clip, and the list blinks back for the next run. */
const MergedList = ({ clipId }: { clipId: string }) => (
   <g clipPath={`url(#${clipId})`}>
      <motion.g
         animate={{
            y: [0, 0, ROW_PITCH, ROW_PITCH, 0, 0],
            opacity: [1, 1, 0, 0, 1],
         }}
         transition={{
            y: loop(0, 2.3, 2.9, 5.5, 5.6, CYCLE),
            opacity: loop(0, RESET, RESET + 0.3, 5.7, CYCLE),
         }}
      >
         {MERGED_ROWS.map((row) => (
            <g key={row.y}>
               <RowBody row={row} />
               <MergedMark y={row.y} />
            </g>
         ))}
      </motion.g>
   </g>
);

/* The pull request that lands: lifts, rises into the merged card, and its
   hollow review ring gives way to the green merged dot. */
const PR_TIMES = [0, LIFT_AT, MOVE_AT, MOVE_TO, RESET, 5.5, 5.6, 5.7, CYCLE];
const Landing = () => (
   <motion.g
      animate={{
         y: [0, 0, 0, RISE, RISE, RISE, 0, 0, 0],
         scale: [1, 1, 1.03, 1, 1, 1, 1, 1, 1],
         opacity: [1, 1, 1, 1, 1, 0, 0, 0, 1],
      }}
      transition={loop(...PR_TIMES)}
   >
      <RowBody row={LANDING} />
      <motion.g
         animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
         transition={loop(0, TURN_AT, TURN_AT + 0.4, 5.6, 5.65, CYCLE)}
      >
         <OpenMark y={LANDING.y} />
      </motion.g>
      <motion.circle
         cx={MARK_X}
         cy={LANDING.y}
         r={MARK_R}
         fill={GREEN}
         animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0.4, 0.4, 1, 1, 0.4, 0.4],
         }}
         transition={loop(0, TURN_AT + 0.2, TURN_AT + 0.6, 5.6, 5.65, CYCLE)}
      />
   </motion.g>
);

const OssCardPipeline = ({ tint }: PipelineProps) => {
   const clipId = useId();
   return (
      <>
         <SceneSvg>
            <defs>
               <clipPath id={clipId}>
                  <rect
                     x={MERGED.x}
                     y={MERGED.y + HEAD_H}
                     width={MERGED.w}
                     height={MERGED.h - HEAD_H - 8}
                  />
               </clipPath>
            </defs>
            <QueryPanel tint={tint} fields={[128, 78, 108]} targets={TARGETS} />
            <Panel {...MERGED} />
            <Panel {...REVIEW} />
            <MergedList clipId={clipId} />
            <RowBody row={OPEN_ROW} />
            <OpenMark y={OPEN_ROW.y} />
            <Landing />
         </SceneSvg>
         <QueryOverlay tint={tint} label="IS:PR" targets={TARGETS} />
         <Label
            x={MERGED.x + 32}
            y={MERGED.y + 44}
            text="MERGED"
            color={GREEN}
         />
         <Label
            x={REVIEW.x + 32}
            y={REVIEW.y + 44}
            text="IN REVIEW"
            color={WHITE_55}
         />
      </>
   );
};

export default OssCardPipeline;
