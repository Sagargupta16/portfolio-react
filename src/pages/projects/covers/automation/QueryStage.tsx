import { motion } from "motion/react";
import {
   CYCLE,
   LAND_AT,
   NON_SCALING,
   QUERY,
   QUERY_OUT,
   SEND_AT,
   SEND_STAGGER,
   WHITE_22,
   WHITE_35,
   curve,
   curvePoints,
   loop,
} from "./sceneTokens";
import type { Point } from "./sceneTokens";
import { CronGlyph, Label, Packet, Panel, Rule, Wire } from "./primitives";

/* The fetch stage the three card actions share: the daily cron fires one
   GraphQL request, its fields type in, and the response leaves as a packet
   for each card the run renders. The panel lives in the scene SVG and the
   dial, packets and caption in the HTML overlay, so it comes in two parts. */

const HEADER_Y = QUERY.y + 46;
const FIELD_X = QUERY.x + 84;
const FIELD_TOP = QUERY.y + 120;
const FIELD_PITCH = 46;
const KEY_W = 52;
const RESET = 5.3;

/* Opening brace of the query body, left of the field lines. */
const BX = QUERY.x + 62;
const BY = QUERY.y + 90;
const BRACE = `M${BX} ${BY} Q${BX - 16} ${BY} ${BX - 16} ${BY + 16} L${BX - 16} ${BY + 54} Q${BX - 16} ${BY + 70} ${BX - 29} ${BY + 70} Q${BX - 16} ${BY + 70} ${BX - 16} ${BY + 86} L${BX - 16} ${BY + 124} Q${BX - 16} ${BY + 140} ${BX} ${BY + 140}`;

interface QueryPanelProps {
   tint: string;
   /** Value widths of the three field lines, in viewBox units. */
   fields: readonly number[];
   /** Where each response packet lands, one per rendered card. */
   targets: readonly Point[];
}

export const QueryPanel = ({ tint, fields, targets }: QueryPanelProps) => (
   <>
      {targets.map((target) => (
         <Wire
            key={target.join()}
            d={curve(QUERY_OUT, target)}
            color={`${tint}40`}
         />
      ))}
      <Panel {...QUERY} />
      <Rule x={QUERY.x + 76} y={HEADER_Y} w={120} color={WHITE_22} />
      <path
         d={BRACE}
         fill="none"
         stroke={WHITE_35}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <motion.g
         animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
         transition={loop(0, 0.25, 0.95, RESET, RESET + 0.4, CYCLE)}
         style={{ originX: 0 }}
      >
         {fields.map((w, i) => (
            <g key={w}>
               <Rule
                  x={FIELD_X}
                  y={FIELD_TOP + i * FIELD_PITCH}
                  w={KEY_W}
                  color={`${tint}cc`}
               />
               <Rule
                  x={FIELD_X + KEY_W + 16}
                  y={FIELD_TOP + i * FIELD_PITCH}
                  w={w}
                  color={WHITE_35}
               />
            </g>
         ))}
      </motion.g>
   </>
);

interface QueryOverlayProps {
   tint: string;
   label: string;
   targets: readonly Point[];
}

export const QueryOverlay = ({ tint, label, targets }: QueryOverlayProps) => (
   <>
      <CronGlyph tint={tint} x={QUERY.x + 44} y={HEADER_Y} />
      {targets.map((target, i) => (
         <Packet
            key={target.join()}
            tint={tint}
            points={curvePoints(QUERY_OUT, target, 5)}
            from={SEND_AT + i * SEND_STAGGER}
            to={LAND_AT + i * SEND_STAGGER}
         />
      ))}
      <Label x={QUERY.x} y={QUERY.y - 40} text={label} color={`${tint}b3`} />
   </>
);
