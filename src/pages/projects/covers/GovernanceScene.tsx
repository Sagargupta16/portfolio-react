import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * AWS Organizations governance on a Control Tower landing zone.
 * The management account sits above the org root and three OUs, with two
 * child OUs under Workloads. An SCP drops from the management account to the
 * root and on to Workloads; once it attaches, both child OUs light up in turn
 * (inheritance is an Organizations behaviour, the policy itself attaches
 * once). An RCP then lands on Sandbox, a control switches on in each child
 * OU (green dot), and the dashed delegated-admin designation fades in toward
 * the Security OU, where Control Tower keeps the Audit account.
 *
 * Coordinates are viewBox units (0..100 x, 0..62.5 y) so the tree keeps its
 * shape at every card width; motion is opacity plus x/y translate only.
 */

const CYCLE = 6;
const GREEN = "#22c55e";
const NON_SCALING = "non-scaling-stroke";
const WHITE_10 = "rgba(255,255,255,0.10)";
const WHITE_03 = "rgba(255,255,255,0.03)";

/* one easing per keyframe segment so WAAPI opacity and frameloop transforms share beats */
const loop = (times: number[], delay = 0) => ({
   duration: CYCLE,
   repeat: Infinity,
   delay,
   times,
   ease: times.slice(1).map(() => "easeInOut" as const),
});

interface Node {
   x: number;
   y: number;
   w: number;
}

const NODE_H = 5;
const MGMT: Node = { x: 50, y: 7, w: 16 };
const ROOT: Node = { x: 50, y: 20, w: 9 };
const SECURITY: Node = { x: 20, y: 34, w: 14 };
const WORKLOADS: Node = { x: 50, y: 34, w: 14 };
const SANDBOX: Node = { x: 80, y: 34, w: 14 };
const PROD: Node = { x: 40, y: 49, w: 11 };
const DEV: Node = { x: 60, y: 49, w: 11 };

const top = (n: Node) => n.y - NODE_H / 2;
const bottom = (n: Node) => n.y + NODE_H / 2;

/* elbow connector from a parent's bottom edge to a child's top edge */
const edge = (from: Node, to: Node) => {
   const midY = (bottom(from) + top(to)) / 2;
   return `M ${from.x} ${bottom(from)} V ${midY} H ${to.x} V ${top(to)}`;
};

const EDGES = [
   edge(MGMT, ROOT),
   edge(ROOT, SECURITY),
   edge(ROOT, WORKLOADS),
   edge(ROOT, SANDBOX),
   edge(WORKLOADS, PROD),
   edge(WORKLOADS, DEV),
];

const LABELS = {
   mgmt: "MGMT",
   scp: "SCP",
   rcp: "RCP",
   delegated: "DELEGATED",
};

const hairline = (stroke: string, width = 0.9) => ({
   stroke,
   strokeWidth: width,
   vectorEffect: NON_SCALING,
});

const rectOf = (n: Node) => ({
   x: n.x - n.w / 2,
   y: top(n),
   width: n.w,
   height: NODE_H,
   rx: 1,
});

const chipText: CSSProperties = {
   fontFamily: MONO_FONT,
   fontWeight: 700,
   letterSpacing: "0.12em",
};

/* A static OU box in neutral chrome. */
const Box = ({ node }: { node: Node }) => (
   <rect {...rectOf(node)} {...hairline(WHITE_10)} fill={WHITE_03} />
);

/* Tint overlay that lights a box on its beat and fades before the loop restarts. */
const Lit = ({
   node,
   tint,
   times,
   opacity,
}: {
   node: Node;
   tint: string;
   times: number[];
   opacity: number[];
}) => (
   <motion.rect
      {...rectOf(node)}
      {...hairline(tint, 1.1)}
      fill={`${tint}22`}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={loop(times)}
   />
);

/* A policy document travelling down the tree, then holding at its attach point. */
const PolicyChip = ({
   text,
   tint,
   xs,
   ys,
   times,
   opacity,
}: {
   text: string;
   tint: string;
   xs: number[];
   ys: number[];
   times: number[];
   opacity: number[];
}) => (
   <motion.g
      initial={{ x: xs[0], y: ys[0], opacity: 0 }}
      animate={{ x: xs, y: ys, opacity }}
      transition={loop(times)}
   >
      <rect
         x={-4.5}
         y={-1.9}
         width={9}
         height={3.8}
         rx={0.9}
         fill="#0b1012"
         {...hairline(tint, 1)}
      />
      <text
         x={0}
         y={0.75}
         textAnchor="middle"
         fontSize={2.1}
         fill={`${tint}ee`}
         style={chipText}
      >
         {text}
      </text>
   </motion.g>
);

/* A control switching on inside a child OU. */
const ControlDot = ({ node, delay }: { node: Node; delay: number }) => (
   <motion.circle
      cx={node.x + node.w / 2 - 1.8}
      cy={node.y}
      r={0.9}
      fill={GREEN}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1, 1, 0] }}
      transition={loop([0, 0.55, 0.62, 0.92, 1], delay)}
   />
);

/* SCP: management account -> root -> Workloads, attached from ~30% to the fade. */
const SCP_TIMES = [0, 0.05, 0.15, 0.25, 0.92, 1];
const SCP_X = [
   MGMT.x + 6,
   MGMT.x + 6,
   ROOT.x + 6,
   WORKLOADS.x + 9,
   WORKLOADS.x + 9,
   WORKLOADS.x + 9,
];
const SCP_Y = [MGMT.y, MGMT.y, ROOT.y, WORKLOADS.y, WORKLOADS.y, WORKLOADS.y];
const SCP_OPACITY = [0, 1, 1, 1, 1, 0];

/* RCP: follows a beat later and attaches to Sandbox. */
const RCP_TIMES = [0, 0.3, 0.4, 0.5, 0.92, 1];
const RCP_X = [
   MGMT.x + 6,
   MGMT.x + 6,
   ROOT.x + 6,
   SANDBOX.x - 3,
   SANDBOX.x - 3,
   SANDBOX.x - 3,
];
const RCP_Y = [
   MGMT.y,
   MGMT.y,
   ROOT.y,
   SANDBOX.y + 5,
   SANDBOX.y + 5,
   SANDBOX.y + 5,
];

const LIT_WORKLOADS = {
   times: [0, 0.24, 0.3, 0.92, 1],
   opacity: [0, 0, 1, 1, 0],
};
const LIT_PROD = { times: [0, 0.32, 0.38, 0.92, 1], opacity: [0, 0, 1, 1, 0] };
const LIT_DEV = { times: [0, 0.38, 0.44, 0.92, 1], opacity: [0, 0, 1, 1, 0] };
const LIT_SANDBOX = {
   times: [0, 0.49, 0.55, 0.92, 1],
   opacity: [0, 0, 1, 1, 0],
};
const DELEGATE = { times: [0, 0.68, 0.76, 0.92, 1], opacity: [0, 0, 1, 1, 0] };

const DELEGATE_PATH = `M ${MGMT.x - MGMT.w / 2} ${MGMT.y} H ${SECURITY.x} V ${top(SECURITY)}`;

const label: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

export default function GovernanceScene({ tint }: CoverSceneProps) {
   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         <div
            style={{
               position: "absolute",
               inset: 0,
               background: `radial-gradient(circle at 50% 30%, ${tint}14 0%, transparent 60%)`,
            }}
         />
         <svg
            viewBox="0 0 100 62.5"
            style={{
               position: "absolute",
               inset: 0,
               width: "100%",
               height: "100%",
            }}
         >
            {EDGES.map((d) => (
               <path
                  key={d}
                  d={d}
                  fill="none"
                  {...hairline("rgba(255,255,255,0.14)")}
               />
            ))}
            <motion.path
               d={DELEGATE_PATH}
               fill="none"
               {...hairline(`${tint}aa`)}
               strokeDasharray="1.6 1.4"
               initial={{ opacity: 0 }}
               animate={{ opacity: DELEGATE.opacity }}
               transition={loop(DELEGATE.times)}
            />

            <rect
               {...rectOf(MGMT)}
               {...hairline(`${tint}80`)}
               fill={`${tint}18`}
            />
            {[ROOT, SECURITY, WORKLOADS, SANDBOX, PROD, DEV].map((n) => (
               <Box key={`${n.x}-${n.y}`} node={n} />
            ))}

            <Lit node={WORKLOADS} tint={tint} {...LIT_WORKLOADS} />
            <Lit node={PROD} tint={tint} {...LIT_PROD} />
            <Lit node={DEV} tint={tint} {...LIT_DEV} />
            <Lit node={SANDBOX} tint={tint} {...LIT_SANDBOX} />

            <ControlDot node={PROD} delay={0} />
            <ControlDot node={DEV} delay={0.2} />

            <PolicyChip
               text={LABELS.scp}
               tint={tint}
               xs={SCP_X}
               ys={SCP_Y}
               times={SCP_TIMES}
               opacity={SCP_OPACITY}
            />
            <PolicyChip
               text={LABELS.rcp}
               tint={tint}
               xs={RCP_X}
               ys={RCP_Y}
               times={RCP_TIMES}
               opacity={SCP_OPACITY}
            />
         </svg>

         <span
            style={{
               ...label,
               left: "50%",
               top: `${(MGMT.y / 62.5) * 100}%`,
               transform: "translate(-50%, -50%)",
               color: `${tint}dd`,
            }}
         >
            {LABELS.mgmt}
         </span>
         <motion.span
            style={{
               ...label,
               left: `${SECURITY.x - SECURITY.w / 2}%`,
               top: `${((MGMT.y + 4.2) / 62.5) * 100}%`,
               color: `${tint}bb`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: DELEGATE.opacity }}
            transition={loop(DELEGATE.times)}
         >
            {LABELS.delegated}
         </motion.span>
      </div>
   );
}
