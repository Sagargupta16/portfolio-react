import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   GREEN,
   HAIRLINE,
   LABEL_LIT,
   NON_SCALING,
   WHITE_18,
   appear,
   boxAt,
   curveV,
   label,
   labelAt,
   loop,
   panel,
   pctX,
   pctY,
   sweep,
   tintPanel,
} from "./infra/tokens";
import type { Point, TintProps } from "./infra/tokens";
import { FadeLayer, Stage, StageSvg, Wires } from "./infra/primitives";

/*
 * Terraform org governance on a Control Tower landing zone, read top down,
 * laid out like the repo's own topology figure: the management account above
 * the organization root, OUs inside it.
 * 1. An SCP document is created once in the management account, and its two
 *    attachments draw to the Infrastructure and Workloads OUs, which light.
 * 2. Their level 2 OUs inherit (an Organizations behaviour; nothing is
 *    attached to them).
 * 3. An RCP attaches to the root itself, so the whole tree is bounded.
 * 4. Control Tower baselines register parent before child: green on level 1,
 *    then on level 2. Security and Sandbox are dashed: Control Tower owns
 *    them, so they are targeted but never recreated.
 * 5. Delegated administration designates the account in the Security OU; it
 *    deploys nothing into it.
 * One 6 s loop, 12 animated nodes, all of it fading out together.
 */

const CYCLE = 6;

/* Stage anchors, 160 x 100 units. Workloads is the focal point. */
const MGMT: Point = [80, 12];
const SCP: Point = [66, 28];
const RCP: Point = [94, 28];
const SECURITY: Point = [28, 51];
const INFRA: Point = [62, 51];
const WORKLOADS: Point = [102, 51];
const SANDBOX: Point = [134, 51];
/* level 2: Network and Shared Services (examples/enterprise), Production and
   Non-Production (examples/standard) */
const NETWORK: Point = [52, 75];
const SHARED: Point = [72, 75];
const PROD: Point = [92, 75];
const NON_PROD: Point = [112, 75];
const ROOT = { x: 12, y: 37, width: 136, height: 57, rx: 4 };

const OU = { w: 34, h: 18 };
const CHILD = { w: 28, h: 14 };
const SEC = { w: 38, h: 20 };
const ACCOUNT = { w: 11, h: 8 };

const SCP_TO_INFRA = curveV(SCP, INFRA);
const SCP_TO_WORKLOADS = curveV(SCP, WORKLOADS);
const RCP_TO_ROOT = curveV(RCP, [124, ROOT.y]);
const DELEGATE = `M ${MGMT[0]} ${MGMT[1]} C 40 ${MGMT[1]} ${SECURITY[0]} 26 ${SECURITY[0]} ${SECURITY[1]}`;
const TREE = [
   curveV(MGMT, SCP),
   curveV(MGMT, RCP),
   curveV(INFRA, NETWORK),
   curveV(INFRA, SHARED),
   curveV(WORKLOADS, PROD),
   curveV(WORKLOADS, NON_PROD),
];

/* ---------------- policy attachments ---------------- */

/* A uniform-stage draw (no vector-effect), hidden while it resets. */
const Attachment = ({
   d,
   tint,
   at,
}: {
   d: string;
   tint: string;
   at: number;
}) => (
   <motion.path
      d={d}
      fill="none"
      stroke={tint}
      strokeWidth={0.75}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1, 0, 0] }}
      transition={{
         pathLength: loop(CYCLE, [0, at, at + 0.12, 1]),
         opacity: loop(CYCLE, [0, at - 0.005, at + 0.005, 0.92, 0.97, 1]),
      }}
   />
);

const DELEGATE_FADE = appear(0.72);
const ROOT_LIT = appear(0.49);

const Wiring = ({ tint }: TintProps) => (
   <StageSvg>
      {/* the organization root, holding the OU tree */}
      <rect
         {...ROOT}
         fill="none"
         stroke={HAIRLINE}
         vectorEffect={NON_SCALING}
      />
      <motion.rect
         {...ROOT}
         fill={`${tint}0a`}
         stroke={`${tint}99`}
         vectorEffect={NON_SCALING}
         initial={{ opacity: 0 }}
         animate={{ opacity: ROOT_LIT.opacity }}
         transition={loop(CYCLE, ROOT_LIT.times)}
      />
      <Wires paths={TREE} />
      <Attachment d={SCP_TO_INFRA} tint={tint} at={0.08} />
      <Attachment d={SCP_TO_WORKLOADS} tint={tint} at={0.1} />
      <Attachment d={RCP_TO_ROOT} tint={tint} at={0.38} />
      {/* delegated admin designation: px dashes flowing, so non-scaling */}
      <motion.path
         d={DELEGATE}
         fill="none"
         stroke={tint}
         strokeDasharray="4 4"
         vectorEffect={NON_SCALING}
         initial={{ strokeDashoffset: 0, opacity: 0 }}
         animate={{
            strokeDashoffset: [0, -96],
            opacity: DELEGATE_FADE.opacity,
         }}
         transition={{
            strokeDashoffset: sweep(CYCLE),
            opacity: loop(CYCLE, DELEGATE_FADE.times),
         }}
      />
   </StageSvg>
);

/* ---------------- management account and policy documents ---------------- */

const chipText: CSSProperties = { ...label, letterSpacing: "0.1em" };

const PolicyChip = ({
   at,
   text,
   tint,
   start,
}: {
   at: Point;
   text: string;
   tint: string;
   start: number;
}) => {
   const pop = appear(start);
   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.6 }}
         animate={{ opacity: pop.opacity, scale: [0.6, 0.6, 1, 1, 1, 0.6] }}
         transition={loop(CYCLE, pop.times)}
         style={{
            ...boxAt(at, 27, 13),
            ...tintPanel(tint, 4),
            display: "grid",
            placeItems: "center",
         }}
      >
         <span style={{ ...chipText, color: `${tint}ee` }}>{text}</span>
      </motion.div>
   );
};

const Management = ({ tint }: TintProps) => (
   <div
      style={{
         ...boxAt(MGMT, 84, 19),
         ...tintPanel(tint, 7),
         display: "grid",
         placeItems: "center",
      }}
   >
      <span style={{ ...chipText, color: `${tint}dd` }}>MANAGEMENT</span>
   </div>
);

/* ---------------- OU tree ---------------- */

const ctOwned: CSSProperties = {
   ...panel(4),
   border: `1px dashed ${WHITE_18}`,
};

const OuBox = ({
   at,
   size,
   owned = false,
}: {
   at: Point;
   size: { w: number; h: number };
   owned?: boolean;
}) => (
   <div
      style={{ ...boxAt(at, size.w, size.h), ...(owned ? ctOwned : panel(4)) }}
   />
);

const litBox = (at: Point, size: { w: number; h: number }, tint: string) => (
   <div
      style={{
         ...boxAt(at, size.w, size.h),
         borderRadius: 4,
         border: `1px solid ${tint}a6`,
         background: `${tint}26`,
      }}
   />
);

/* 4 px status dot in a box's top right corner. */
const cornerDot = ([x, y]: Point, size: { w: number; h: number }) => (
   <div
      style={{
         position: "absolute",
         left: `calc(${pctX(x)} + ${size.w / 2 - 7}px)`,
         top: `calc(${pctY(y)} - ${size.h / 2 - 3}px)`,
         width: 4,
         height: 4,
         borderRadius: "50%",
         background: GREEN,
      }}
   />
);

/* One node per beat: every overlay in a beat shares its opacity. */
const Beat = ({ at, children }: { at: number; children: ReactNode }) => (
   <FadeLayer cycle={CYCLE} fade={appear(at)}>
      {children}
   </FadeLayer>
);

const Tree = ({ tint }: TintProps) => (
   <>
      <OuBox at={SECURITY} size={SEC} owned />
      <OuBox at={INFRA} size={OU} />
      <OuBox at={WORKLOADS} size={OU} />
      <OuBox at={SANDBOX} size={OU} owned />
      <OuBox at={NETWORK} size={CHILD} />
      <OuBox at={SHARED} size={CHILD} />
      <OuBox at={PROD} size={CHILD} />
      <OuBox at={NON_PROD} size={CHILD} />
      {/* the member account in Security that delegation designates */}
      <div
         style={{
            ...boxAt(SECURITY, ACCOUNT.w, ACCOUNT.h),
            borderRadius: 2,
            border: `1px solid ${WHITE_18}`,
         }}
      />
      <span style={labelAt(SECURITY, SEC.h / 2 + 6)}>DELEGATED</span>

      {/* SCP attached: both targets light */}
      <Beat at={0.21}>
         {litBox(INFRA, OU, tint)}
         {litBox(WORKLOADS, OU, tint)}
      </Beat>
      {/* inherited, never attached */}
      <Beat at={0.27}>
         {litBox(NETWORK, CHILD, tint)}
         {litBox(SHARED, CHILD, tint)}
         {litBox(PROD, CHILD, tint)}
         {litBox(NON_PROD, CHILD, tint)}
      </Beat>
      {/* Control Tower baselines: parent before child */}
      <Beat at={0.56}>
         {cornerDot(INFRA, OU)}
         {cornerDot(WORKLOADS, OU)}
      </Beat>
      <Beat at={0.64}>
         {cornerDot(NETWORK, CHILD)}
         {cornerDot(SHARED, CHILD)}
         {cornerDot(PROD, CHILD)}
         {cornerDot(NON_PROD, CHILD)}
      </Beat>
      {/* the delegated administrator account lights with its label */}
      <Beat at={0.78}>
         <div
            style={{
               ...boxAt(SECURITY, ACCOUNT.w, ACCOUNT.h),
               borderRadius: 2,
               border: `1px solid ${tint}`,
               background: `${tint}66`,
            }}
         />
         <span style={labelAt(SECURITY, SEC.h / 2 + 6, LABEL_LIT)}>
            DELEGATED
         </span>
      </Beat>
   </>
);

export default function GovernanceScene({ tint }: TintProps) {
   return (
      <Stage tint={tint} focus={WORKLOADS} backdrop="grid">
         <Wiring tint={tint} />
         <Management tint={tint} />
         <PolicyChip at={SCP} text="SCP" tint={tint} start={0.04} />
         <PolicyChip at={RCP} text="RCP" tint={tint} start={0.34} />
         <Tree tint={tint} />
      </Stage>
   );
}
