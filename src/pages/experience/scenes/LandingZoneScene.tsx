import type { CSSProperties } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Pip,
   Wire,
} from "@pages/projects/covers/kit/primitives";
import {
   GREEN,
   GRID,
   INK,
   NON_SCALING,
   W16,
   W25,
   layer,
   line,
   lit,
   ride,
   route,
   sCurve,
   curveD,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Dashed, Draw, Frame, Slot } from "./SceneFrame";
import {
   END,
   GONE,
   beat,
   boxAt,
   chip,
   growX,
   held,
   play,
   pop,
} from "./sceneParts";

/*
 * The landing zone built as Terraform, read left to right in one 6 s loop:
 *   guardrails    an SCP attaches at the organization root and draws out to
 *                 both OUs, which light
 *   new account   an account lands in its OU and its baseline fills in one
 *                 quick sweep (the setup cut, shown as speed, not a number)
 *   onboarding    the account's spoke VPC lights, attaches to the hub, gets
 *                 its own route table row, and a tag opens the firewall
 *   traffic       a packet leaves the VPC through the firewall and crosses
 *                 to the second Transit Gateway hub
 * 11 animated nodes, 4 labels.
 */

/* ---------------- organization tree ---------------- */

const ROOT: Box = [62, 24, 56, 18];
const OU_W = 56;
const OU_H = 64;
const OU_Y = 62;
const OU_X = [28, 96];
const TILE_W = 18;
const TILE_H = 14;
const TILE_COLS = [7, 31];
const TILE_ROWS = [80, 100];
/* the empty account slot in the second OU, filled by the new account */
const NEW_ACCOUNT: Box = [127, 100, TILE_W, TILE_H];

const STEM = "M90,42 V52";
/* root junction out to both OUs; the guardrail draws from its middle */
const BRANCHES = "M56,62 V52 H124 V62";

const tiles = OU_X.flatMap((ox) =>
   TILE_ROWS.flatMap((y) => TILE_COLS.map((dx): Pt => [ox + dx, y])),
).filter(([x, y]) => x !== NEW_ACCOUNT[0] || y !== NEW_ACCOUNT[1]);

const GUARDRAIL = beat({
   times: [0, 0.08, 0.085, 0.17, END, GONE, 1],
   pathLength: [0, 0, 0, 1, 1, 1, 0],
   pathOffset: [0.5, 0.5, 0.5, 0, 0, 0, 0.5],
   opacity: [0, 0, 1, 1, 1, 0, 0],
});
const SCP_CHIP = pop(0.04);
const OU_LIT = held(0.17);
const ACCOUNT = pop(0.24);
const BASELINE = growX(0.28, 0.34);
const BASELINE_OK = held(0.34);

const Tree = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={ROOT} rx={5} />
      <circle cx={72} cy={33} r={2.6} fill={`${tint}b3`} />
      <Bar box={[80, 29.5, 28, 2.5]} fill={W25} />
      <Bar box={[80, 35, 18, 2.5]} fill={W16} />
      <Wire d={STEM} stroke={W16} />
      <Wire d={BRANCHES} stroke={W16} />
      <Draw d={BRANCHES} color={tint} width={1.4} loop={GUARDRAIL} />
      {OU_X.map((x) => (
         <Panel key={x} box={[x, OU_Y, OU_W, OU_H]} rx={5} />
      ))}
      <Bar box={[103, 68.5, 16, 3]} fill={W16} />
      {tiles.map(([x, y]) => (
         <g key={`${x}-${y}`}>
            <Panel box={[x, y, TILE_W, TILE_H]} rx={2.5} />
            <Bar box={[x + 4, y + 5.5, 10, 2.5]} fill={W16} />
         </g>
      ))}
      <Slot box={NEW_ACCOUNT} rx={2.5} />
      {/* guardrail attached: both OUs light */}
      <motion.g {...play(OU_LIT)}>
         {OU_X.map((x) => (
            <Panel
               key={x}
               box={[x, OU_Y, OU_W, OU_H]}
               rx={5}
               fill={`${tint}12`}
               stroke={`${tint}a6`}
            />
         ))}
      </motion.g>
      {/* the new account, then its baseline in one quick sweep */}
      <motion.g {...play(ACCOUNT)}>
         <Panel box={NEW_ACCOUNT} rx={2.5} fill={`${tint}26`} stroke={tint} />
         <Bar box={[130, 108, 12, 2.5]} fill={W16} />
         <motion.g style={{ originX: 0 }} {...play(BASELINE)}>
            <Bar box={[130, 108, 12, 2.5]} fill={tint} />
         </motion.g>
      </motion.g>
   </>
);

/* ---------------- network hubs and onboarding ---------------- */

const HUB_A: Pt = [212, 40];
const HUB_B: Pt = [278, 40];
const HUB_R = 9;
const VPC: Box = [192, 136, 40, 22];
const VPC_TOP: Pt = [212, VPC[1]];
const ATTACH = `M${VPC_TOP[0]},${VPC_TOP[1]} V${HUB_A[1] + HUB_R}`;
const ROUTES: Box = [228, 88, 54, 40];
const FIREWALL: Pt = [212, 76];
const ACCOUNT_LINK = curveD(sCurve([145, 107], [VPC[0], 147]));
const TRAFFIC = route(line(VPC_TOP, HUB_A), line(HUB_A, HUB_B));

const VPC_LIT = held(0.38);
const ATTACHED = beat(
   lit(
      [
         [0.44, 0],
         [0.52, 1],
      ],
      END,
   ),
);
const ROUTE_ROW = growX(0.54, 0.6);
const ALLOWED = held(0.62);
const SENT = beat(
   ride(TRAFFIC, [
      [0.7, 0],
      [0.84, 1],
   ]),
);

const Hub = ({ at, tint }: Readonly<TintProps & { at: Pt }>) => (
   <>
      <circle
         cx={at[0]}
         cy={at[1]}
         r={HUB_R}
         fill={INK}
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
      <circle cx={at[0]} cy={at[1]} r={3} fill={`${tint}99`} />
   </>
);

const Network = ({ tint }: Readonly<TintProps>) => (
   <>
      <Wire d={`M${HUB_A[0] + HUB_R},40 H${HUB_B[0] - HUB_R}`} stroke={W16} />
      {/* an existing spoke on the second hub */}
      <Wire d={`M${HUB_B[0]},${HUB_B[1] + HUB_R} V64`} stroke={W16} />
      <Panel box={[268, 64, 20, 12]} rx={2.5} />
      <Hub at={HUB_A} tint={tint} />
      <Hub at={HUB_B} tint={tint} />
      <Dashed d={ATTACH} />
      <Draw d={ATTACH} color={tint} width={1.4} loop={ATTACHED} />
      <Wire d={`M212,108 H${ROUTES[0]}`} stroke={W16} />
      <Panel box={ROUTES} rx={5} />
      <Bar box={[234, 94, 20, 3]} fill={W25} />
      <Bar box={[234, 103, 40, 2.5]} fill={W16} />
      <Bar box={[234, 110, 32, 2.5]} fill={W16} />
      <motion.g style={{ originX: 0 }} {...play(ROUTE_ROW)}>
         <Bar box={[234, 117, 38, 2.5]} fill={tint} />
      </motion.g>
      <Slot box={VPC} rx={4} />
      {/* the new account's spoke VPC */}
      <motion.g {...play(VPC_LIT)}>
         <Dashed d={ACCOUNT_LINK} stroke={`${tint}80`} />
         <Panel box={VPC} rx={4} fill={`${tint}1f`} stroke={`${tint}b3`} />
      </motion.g>
   </>
);

/* ---------------- front layer ---------------- */

const firewall: CSSProperties = {
   ...boxAt(FIREWALL, 16, 10),
   borderRadius: 2,
   border: `1px solid ${W25}`,
   background: `repeating-linear-gradient(90deg, ${W25} 0 1px, ${INK} 1px 5px)`,
};

const tag = (tint: string): CSSProperties => ({
   ...boxAt([240, 147], 13, 8),
   borderRadius: "2px 4px 4px 2px",
   border: `1px solid ${tint}`,
   background: `${tint}26`,
});

const Front = ({ tint }: Readonly<TintProps>) => (
   <>
      <motion.span style={chip(tint, [136, 33])} {...play(SCP_CHIP)}>
         SCP
      </motion.span>
      <Label at={[35, 70]}>OU</Label>
      <Pip at={[141, 103.5]} color={GREEN} loop={BASELINE_OK} />
      <Label at={[245, 29]} centered>
         TGW
      </Label>
      <div style={firewall} />
      <Label at={[212, 147]} centered>
         VPC
      </Label>
      {/* firewall access by tag: the tag lands, the firewall opens */}
      <motion.div style={layer} {...play(ALLOWED)}>
         <div
            style={{
               ...firewall,
               border: `1px solid ${GREEN}`,
               background: `${GREEN}26`,
            }}
         />
         <div style={tag(tint)} />
      </motion.div>
      <Packet color={tint} loop={SENT} />
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Tree tint={tint} />
      <Network tint={tint} />
   </>
);

export default function LandingZoneScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="58% 42%"
         texture={GRID}
         stage={<Stage tint={tint} />}
      >
         <Front tint={tint} />
      </Frame>
   );
}
