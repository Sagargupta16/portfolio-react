import { motion } from "motion/react";
import {
   CYCLE,
   NON_SCALING,
   WHITE_14,
   WHITE_22,
   WHITE_35,
   curve,
   curvePoints,
   loop,
   travelStamps,
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

/* Credly Badge README Action (update-credly-badges.py): the weekly cron
   fetches badges.json, categorize_badges splits it on the cert and partner
   keywords, and each group lands as its own centred row, under its section
   heading, between the CREDLY-BADGES START and END markers of README.md. */

const JSON_PANEL = { x: 136, y: 260, w: 290, h: 380 };
const HEADER_Y = JSON_PANEL.y + 46;
const ENTRY_TOP = JSON_PANEL.y + 110;
const ENTRY_PITCH = 56;
const ENTRY_WIDTHS = [150, 118, 166, 104, 136];

const FORK: Point = [560, JSON_PANEL.y + JSON_PANEL.h / 2];
const README = { x: 840, y: 120, w: 624, h: 680 };
const README_MID = README.x + README.w / 2;
const MARKER_YS = [README.y + 126, README.y + 560];

interface BadgeRow {
   /** Category in the action's own words, for the key. */
   id: string;
   y: number;
   r: number;
   /** Badge centres, laid out centred like the README's div rows. */
   cxs: number[];
   /** Industry certifications are drawn large and solid. */
   lead: boolean;
}

const centred = (count: number, r: number): number[] => {
   const pitch = r * 2 + 22;
   const first = README_MID - (pitch * (count - 1)) / 2;
   return Array.from({ length: count }, (_, i) => first + i * pitch);
};

const ROWS: BadgeRow[] = [
   { id: "certifications", y: 350, r: 36, cxs: centred(4, 36), lead: true },
   { id: "professional", y: 482, r: 26, cxs: centred(3, 26), lead: false },
   { id: "knowledge", y: 600, r: 26, cxs: centred(5, 26), lead: false },
];
/* Section heading line above each row, as the README prints them. */
const HEADING_GAP = 30;

/* Beats, cycle seconds: one packet per category, each landing its row. */
const PACKET_AT = 1;
const PACKET_STAGGER = 0.26;
const PACKET_TIME = 0.95;
const MARKERS_AT = 3.05;
const RESET = 5.3;

const departs = (row: number) => PACKET_AT + row * PACKET_STAGGER;
const arrives = (row: number) => departs(row) + PACKET_TIME;

/* Pointy-top hexagon, the Credly badge silhouette. */
const hexagon = (cx: number, cy: number, r: number): string =>
   [-90, -30, 30, 90, 150, 210]
      .map((deg) => {
         const a = (deg * Math.PI) / 180;
         return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      })
      .join(" ");

/* Route of one category: panel edge, through the fork, out its lane. */
const lane = (y: number): [Point, Point] => [FORK, [README.x, y]];
const route = (y: number): Point[] => [
   [JSON_PANEL.x + JSON_PANEL.w, FORK[1]],
   ...curvePoints(...lane(y), 5),
];
/* When each packet crosses the fork, from the same distance-spaced clock. */
const FORK_HITS = ROWS.map(
   (row, i) => travelStamps(route(row.y), departs(i), arrives(i))[1],
);

/* Fetched badges.json entries, one hexagon and name each. */
const Entries = ({ tint }: { tint: string }) => (
   <motion.g
      animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [18, 18, 0, 0, 0, 18] }}
      transition={loop(0, 0.3, 0.75, RESET, RESET + 0.35, CYCLE)}
   >
      {ENTRY_WIDTHS.map((w, i) => {
         const y = ENTRY_TOP + i * ENTRY_PITCH;
         return (
            <g key={w}>
               <polygon
                  points={hexagon(JSON_PANEL.x + 56, y, 16)}
                  fill="none"
                  stroke={`${tint}99`}
                  strokeWidth={1}
                  vectorEffect={NON_SCALING}
               />
               <Rule x={JSON_PANEL.x + 92} y={y} w={w} color={WHITE_35} />
            </g>
         );
      })}
   </motion.g>
);

/* The categorize step: a diamond that rings as each packet passes. */
const Fork = ({ tint }: { tint: string }) => (
   <>
      <rect
         x={FORK[0] - 15}
         y={FORK[1] - 15}
         width={30}
         height={30}
         rx={4}
         transform={`rotate(45 ${FORK[0]} ${FORK[1]})`}
         fill={`${tint}26`}
         stroke={`${tint}b3`}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <motion.circle
         cx={FORK[0]}
         cy={FORK[1]}
         r={30}
         fill="none"
         stroke={tint}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
         animate={{
            opacity: [0, 0, 0.9, 0, 0.9, 0, 0.9, 0, 0],
            scale: [0.6, 0.6, 1, 1.5, 1, 1.5, 1, 1.5, 0.6],
         }}
         transition={loop(
            0,
            FORK_HITS[0],
            FORK_HITS[0] + 0.05,
            FORK_HITS[1],
            FORK_HITS[1] + 0.05,
            FORK_HITS[2],
            FORK_HITS[2] + 0.05,
            FORK_HITS[2] + 0.3,
            CYCLE,
         )}
      />
   </>
);

/* One category row sliding in between the markers as its packet lands. */
const Row = ({
   tint,
   row,
   index,
}: {
   tint: string;
   row: BadgeRow;
   index: number;
}) => {
   const at = arrives(index);
   return (
      <motion.g
         animate={{ opacity: [0, 0, 1, 1, 0, 0], x: [-36, -36, 0, 0, 0, -36] }}
         transition={loop(0, at - 0.05, at + 0.3, RESET, RESET + 0.35, CYCLE)}
      >
         {row.cxs.map((cx) => (
            <polygon
               key={cx}
               points={hexagon(cx, row.y, row.r)}
               fill={row.lead ? `${tint}40` : `${tint}1f`}
               stroke={row.lead ? `${tint}cc` : `${tint}73`}
               strokeWidth={1}
               vectorEffect={NON_SCALING}
            />
         ))}
      </motion.g>
   );
};

/* README.md: a heading, the two dashed markers, a heading per section,
   text below the badge block. */
const Readme = ({ tint }: { tint: string }) => (
   <>
      <Panel {...README} />
      <Rule x={README.x + 40} y={README.y + 60} w={200} color={WHITE_35} />
      <Rule x={README.x + 40} y={README.y + 620} w={320} color={WHITE_14} />
      {ROWS.map((row) => (
         <Rule
            key={row.id}
            x={README_MID - 60}
            y={row.y - row.r - HEADING_GAP}
            w={120}
            color={WHITE_22}
         />
      ))}
      <motion.g
         animate={{ opacity: [0.4, 0.4, 1, 0.4, 0.4] }}
         transition={loop(
            0,
            MARKERS_AT,
            MARKERS_AT + 0.25,
            MARKERS_AT + 0.8,
            CYCLE,
         )}
      >
         {MARKER_YS.map((y) => (
            <line
               key={y}
               x1={README.x + 36}
               x2={README.x + README.w - 36}
               y1={y}
               y2={y}
               stroke={tint}
               strokeWidth={1}
               strokeDasharray="5 4"
               vectorEffect={NON_SCALING}
            />
         ))}
      </motion.g>
   </>
);

const BadgePipeline = ({ tint }: PipelineProps) => {
   const caption = `${tint}b3`;
   return (
      <>
         <SceneSvg>
            <Wire
               d={`M${JSON_PANEL.x + JSON_PANEL.w} ${FORK[1]} L${FORK[0]} ${FORK[1]}`}
               color={`${tint}40`}
            />
            {ROWS.map((row) => (
               <Wire
                  key={row.id}
                  d={curve(...lane(row.y))}
                  color={`${tint}33`}
               />
            ))}
            <Panel {...JSON_PANEL} />
            <Rule x={JSON_PANEL.x + 76} y={HEADER_Y} w={120} color={WHITE_22} />
            <Entries tint={tint} />
            <Fork tint={tint} />
            <Readme tint={tint} />
            {ROWS.map((row, i) => (
               <Row key={row.id} tint={tint} row={row} index={i} />
            ))}
         </SceneSvg>
         <CronGlyph tint={tint} x={JSON_PANEL.x + 44} y={HEADER_Y} />
         {ROWS.map((row, i) => (
            <Packet
               key={row.id}
               tint={tint}
               points={route(row.y)}
               from={departs(i)}
               to={arrives(i)}
            />
         ))}
         <Pop
            x={README.x + README.w - 48}
            y={README.y + 60}
            at={MARKERS_AT + 0.1}
            until={RESET}
         />
         <Label
            x={JSON_PANEL.x}
            y={JSON_PANEL.y - 40}
            text="BADGES.JSON"
            color={caption}
         />
         <Label
            x={FORK[0] + 20}
            y={FORK[1] - 100}
            text="CATEGORIZE"
            color={caption}
            align="center"
         />
         <Label
            x={README.x}
            y={README.y - 40}
            text="README.MD"
            color={caption}
         />
      </>
   );
};

export default BadgePipeline;
