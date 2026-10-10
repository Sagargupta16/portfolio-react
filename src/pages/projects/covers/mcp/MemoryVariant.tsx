import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Pip,
   Shell,
   Trace,
   Wire,
} from "../kit/primitives";
import {
   DOTS,
   GREEN,
   INK,
   W10,
   W16,
   W25,
   clock,
   comet,
   curveD,
   line,
   lit,
   loopProps,
   ride,
   route,
   sCurve,
   shown,
} from "../kit/sceneTokens";
import type { Box, Pt, Stop, TintProps } from "../kit/sceneTokens";

/*
 * SelfHub: CLAUDE calls store_memory, the SelfHub stdio server writes a new
 * document into the MongoDB `memories` collection (newest first), then VS CODE
 * calls search_memories, the $text match on that same row lights up and the
 * hit rides back into VS Code. Memory written by one client, recalled by the
 * other.
 */

const beat = clock(6);

/* ports: client right edges, the hub's two sides, the collection's top row */
const CLAUDE_OUT: Pt = [102, 48];
const VSCODE_OUT: Pt = [102, 140];
const HUB_IN: Pt = [136, 94];
const HUB_OUT: Pt = [168, 94];
const STORE_IN: Pt = [196, 68.5];

const CLAUDE_LINK = sCurve(CLAUDE_OUT, HUB_IN);
const VSCODE_LINK = sCurve(VSCODE_OUT, HUB_IN);
const STORE_LINK = sCurve(HUB_OUT, STORE_IN);
const THROUGH_HUB = line(HUB_IN, HUB_OUT);

const STORE_ROUTE = route(CLAUDE_LINK, THROUGH_HUB, STORE_LINK);
const SEARCH_ROUTE = route(VSCODE_LINK, THROUGH_HUB, STORE_LINK);
const [ENTER, EXIT] = STORE_ROUTE.ends;
const [S_ENTER, S_EXIT] = SEARCH_ROUTE.ends;

const HUB: Box = [136, 78, 32, 32];
const COLLECTION: Box = [196, 34, 98, 108];
const ROW_TOPS = [64, 84, 104];
const ROW_STEP = 20;
const LIT_UNTIL = 0.86;

/* store_memory: CLAUDE, through the hub, into the collection */
const STORE_STOPS: Stop[] = [
   [0.03, 0],
   [0.13, ENTER],
   [0.15, EXIT],
   [0.22, 1],
];
/* search_memories out, a hold on the hit, then the result rides home */
const SEARCH_OUT: Stop[] = [
   [0.33, 0],
   [0.43, S_ENTER],
   [0.45, S_EXIT],
   [0.52, 1],
];
const SEARCH_STOPS: Stop[] = [
   ...SEARCH_OUT,
   [0.58, 1],
   [0.65, S_EXIT],
   [0.67, S_ENTER],
   [0.77, 0],
];

const STORE = beat(ride(STORE_ROUTE, STORE_STOPS));
const STORE_TRAIL = beat(comet(STORE_STOPS));
const STORE_LIT = beat(lit(STORE_STOPS, LIT_UNTIL));
const SEARCH = beat(ride(SEARCH_ROUTE, SEARCH_STOPS));
const SEARCH_TRAIL = beat(comet(SEARCH_STOPS));
const SEARCH_LIT = beat(lit(SEARCH_OUT, LIT_UNTIL));

/* the hub ring answers each arrival from a client */
const HUB_RING = beat({
   times: [0, 0.125, 0.145, 0.21, 0.3, 0.425, 0.445, 0.51, 1],
   opacity: [0, 0, 0.8, 0, 0, 0, 0.8, 0, 0],
   scale: [1, 1, 1.08, 1.4, 1, 1, 1.08, 1.4, 1],
});
/* newest first: the stored row slides into slot 0 and pushes the rest down */
const INSERT_TIMES = [0, 0.22, 0.28, 0.88, 0.94, 1];
const NEW_ROW = beat({
   times: INSERT_TIMES,
   opacity: [0, 0, 1, 1, 0, 0],
   x: [-8, -8, 0, 0, 0, -8],
});
const PUSH_DOWN = beat({
   times: INSERT_TIMES,
   y: [0, 0, ROW_STEP, ROW_STEP, 0, 0],
});
const WRITE_PULSE = beat({
   times: [0, 0.23, 0.27, 0.34, 1],
   opacity: [0.45, 0.45, 1, 0.45, 0.45],
   scale: [1, 1, 1.7, 1, 1],
});
/* $text match on the stored row while the search packet holds there */
const HIT = beat(shown(0.52, 0.88));
const RECALL = beat({
   times: [0, 0.77, 0.81, 0.9, 0.94, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   scaleX: [0, 0, 1, 1, 1, 0],
});

const CYLINDER =
   "M204,42 A5.5,2.4 0 0 1 215,42 V48.5 A5.5,2.4 0 0 1 204,48.5 Z M204,42 A5.5,2.4 0 0 0 215,42";
const PROMPT = "M144,88 L150,94 L144,100 M153,100 H161";

/* one document: category chip, content, short id */
const Row = ({
   top,
   width,
   chip,
}: {
   top: number;
   width: number;
   chip: string;
}) => (
   <>
      <Bar box={[204, top + 1, 15, 7]} fill={chip} />
      <Bar box={[225, top + 2, width, 5]} fill={W16} />
      <Bar box={[266, top + 2, 20, 5]} fill={W10} />
   </>
);

const Client = ({ y, tint }: TintProps & { y: number }) => (
   <>
      <Panel box={[26, y, 76, 56]} />
      <Wire d={`M26,${y + 20} H102`} />
      <Bar box={[90, y + 8, 4, 4]} fill={`${tint}99`} />
   </>
);

const Clients = ({ tint }: TintProps) => (
   <>
      <Client y={20} tint={tint} />
      {/* chat: the user's message, the assistant's reply */}
      <Bar box={[60, 47, 34, 8]} fill={`${tint}40`} />
      <Bar box={[36, 60, 50, 4]} fill={W16} />
      <Bar box={[36, 67, 34, 4]} fill={W10} />
      <Client y={112} tint={tint} />
      <Bar box={[36, 139, 38, 4]} fill={W16} />
      <Bar box={[44, 146, 28, 4]} fill={W10} />
      <motion.g style={{ originX: 0 }} {...loopProps(RECALL)}>
         <Bar box={[36, 155, 54, 4]} fill={tint} />
      </motion.g>
   </>
);

const Flight = ({ tint }: TintProps) => (
   <>
      <Wire d={curveD(CLAUDE_LINK)} />
      <Wire d={curveD(VSCODE_LINK)} />
      <Wire d={curveD(STORE_LINK)} />
      <Trace
         d={STORE_ROUTE.d}
         color={`${tint}59`}
         width={1.5}
         loop={STORE_LIT}
      />
      <Trace
         d={SEARCH_ROUTE.d}
         color={`${tint}59`}
         width={1.5}
         loop={SEARCH_LIT}
      />
      <Trace
         d={STORE_ROUTE.d}
         color={`${tint}b3`}
         width={2.6}
         loop={STORE_TRAIL}
      />
      <Trace
         d={SEARCH_ROUTE.d}
         color={`${tint}b3`}
         width={2.6}
         loop={SEARCH_TRAIL}
      />
      {/* the stdio server: opaque so the traces pass under it */}
      <Panel box={HUB} rx={9} fill={INK} stroke="none" />
      <Panel box={HUB} rx={9} fill={`${tint}0d`} stroke={`${tint}59`} />
      <motion.rect
         x={HUB[0]}
         y={HUB[1]}
         width={HUB[2]}
         height={HUB[3]}
         rx={9}
         fill="none"
         stroke={tint}
         {...loopProps(HUB_RING)}
      />
      <Wire d={PROMPT} stroke={tint} />
   </>
);

const Collection = ({ tint }: TintProps) => (
   <>
      <Panel box={COLLECTION} rx={8} />
      <Wire d="M196,56 H294" />
      <Wire d={CYLINDER} stroke={`${tint}b3`} />
      <motion.g {...loopProps(HIT)}>
         <Panel
            box={[200, 61, 90, 15]}
            rx={4}
            fill={`${tint}1a`}
            stroke={`${tint}66`}
         />
      </motion.g>
      <motion.g {...loopProps(NEW_ROW)}>
         <Row top={ROW_TOPS[0]} width={34} chip={tint} />
      </motion.g>
      <motion.g {...loopProps(PUSH_DOWN)}>
         <Row top={ROW_TOPS[0]} width={30} chip={W25} />
         <Row top={ROW_TOPS[1]} width={22} chip={W25} />
         <Row top={ROW_TOPS[2]} width={36} chip={W25} />
      </motion.g>
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Clients tint={tint} />
      <Flight tint={tint} />
      <Collection tint={tint} />
   </>
);

const MemoryVariant = ({ tint }: TintProps) => (
   <Shell
      tint={tint}
      focus="74% 36%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={STORE} />
      <Packet color={tint} loop={SEARCH} />
      <Pip at={[285, 45]} color={GREEN} loop={WRITE_PULSE} />
      <Label at={[36, 30]}>CLAUDE</Label>
      <Label at={[36, 122]}>VS CODE</Label>
      <Label at={[110, 30]} color={`${tint}b3`}>
         STORE_MEMORY
      </Label>
      <Label at={[221, 45]} color={`${tint}cc`}>
         MEMORIES
      </Label>
   </Shell>
);

export default MemoryVariant;
