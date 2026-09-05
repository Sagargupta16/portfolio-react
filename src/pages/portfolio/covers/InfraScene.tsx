import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * AWS container-deploy family.
 * default  -- Blue Green AWS Terraform: ALB :80 streams to TG1, CodeDeploy runs
 *             a 30% canary onto TG2, cuts over, then terminates blue.
 * pipeline -- AWS DevOps Infrastructure: one GitHub Actions rail, commit ->
 *             pytest gate -> image build -> ECR -> rolling ECS task swap.
 * Deliberate cuts against the id 13 brief: the hexagon breath and the env
 * boxes' green-dot pulse are static so each variant holds exactly 12 Motion
 * nodes; `$ terraform apply` is the brief's own prompt, kept outside the four
 * uppercase micro-labels. Env boxes and bottom hints are brief-fixed px and
 * stay clear of each other down to the grid's ~288 px phone slot.
 */

const CYCLE = 6;
const GREEN = "#22c55e";
const RAIL = "rgba(255,255,255,0.08)";
const DIM = "rgba(255,255,255,0.3)";
const LOOP = { duration: CYCLE, repeat: Infinity };
const ABS: React.CSSProperties = { position: "absolute" };
const ROW: React.CSSProperties = { display: "flex", alignItems: "center" };
const CENTER: React.CSSProperties = { ...ROW, justifyContent: "center" };
/* rails and travelling dots share one 16:10 viewBox so px paths scale */
const VIEWBOX = "0 0 340 212";
const SVG_LAYER = { ...ABS, inset: 0, width: "100%", height: "100%" };

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1.2,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};
const tag = (color: string) => ({ ...label, color: `${color}cc` });
const dot = (size: number, color: string): React.CSSProperties => ({
   width: size,
   height: size,
   borderRadius: "50%",
   background: color,
});
/* bordered node: hairline tint border on a faint tint fill */
const box = (color: string, w: number, h: number): React.CSSProperties => ({
   width: w,
   height: h,
   borderRadius: 6,
   border: `1px solid ${color}40`,
   background: `${color}08`,
});

/* ---------------- default: blue/green behind an ALB ---------------- */

/* ALB pill y 25-49 (top 12%), stem to the split rail at y 65, drops land on
   84x56 env boxes centred at x 80 / 260 (23.5% / 76.5%) from y 79 (37.5%). */
const HUB = { ...ABS, left: "50%", top: "12%" };
const ENV = { ...ABS, top: "37.5%", marginLeft: -42 };
const DOT_TIMES = [0, 0.06, 0.2, 0.3, 1];
const CANARY_AT = 0.42 * CYCLE;
const CUTOVER_AT = 0.6 * CYCLE;
const DRAIN_TIMES = [0, 0.6, 0.75, 0.95, 1];
type Cycle = {
   opacity: number[];
   times: number[];
   drain?: { scaleX: number[] };
};
/* TG1 serves, its request bars drain at cutover, it dips as blue is terminated. */
const TG1: Cycle = {
   opacity: [1, 1, 0.25, 0.25, 0.1, 0.1, 1],
   times: [0, 0.6, 0.68, 0.9, 0.92, 0.97, 1],
   drain: { scaleX: [1, 1, 0.55, 0.55, 1] },
};
/* TG2 idles, lights up for the canary, holds through cutover. */
const TG2: Cycle = {
   opacity: [0.25, 0.25, 1, 1, 0.25, 0.25],
   times: [0, 0.42, 0.5, 0.9, 0.96, 1],
};
const CANARY_TIMES = [0, 0.42, 0.48, 0.6, 0.64, 0.8, 0.86, 0.9, 1];
const CLIP = { height: 9, overflow: "hidden" as const };
const BLINK = { duration: 1.6, repeat: Infinity, times: [0, 0.5, 0.5, 1] };
const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
const bar = { height: 2, borderRadius: 2, marginTop: 5 };
const bars = { padding: "0 8px" };

const AlbNode = ({ tint }: { tint: string }) => (
   <div style={{ ...HUB, ...CENTER, ...box(tint, 68, 24), marginLeft: -34 }}>
      <motion.span
         animate={{ opacity: [0.4, 1, 0.4] }}
         transition={{ duration: 2, repeat: Infinity }}
         style={{ ...dot(3, tint), marginRight: 5 }}
      />
      <span style={{ ...label, fontSize: 8, color: tint }}>ALB :80</span>
   </div>
);

type DotProps = { dir: 1 | -1; color: string; delay: number };
/* leaves the ALB, runs the split rail, drops into an env box */
const TrafficDot = ({ dir, color, delay }: DotProps) => (
   <motion.circle
      cx={170}
      cy={49}
      r={2}
      fill={color}
      animate={{
         x: [0, 0, 90 * dir, 90 * dir, 90 * dir],
         y: [0, 18, 18, 40, 40],
         opacity: [0, 1, 1, 0, 0],
      }}
      transition={{ ...LOOP, delay, times: DOT_TIMES, ease: "linear" }}
   />
);

const BlueGreenRail = ({ tint }: { tint: string }) => (
   <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={SVG_LAYER}>
      <path
         d="M 170 49 V 65 M 80 65 H 260 M 80 65 V 79 M 260 65 V 79"
         fill="none"
         stroke={RAIL}
         vectorEffect="non-scaling-stroke"
      />
      {[0, 1, 2].map((i) => (
         <TrafficDot key={`b${i}`} dir={-1} color={tint} delay={i * 0.55} />
      ))}
      {/* canary: one green dot while blue is still landing, then the rest */}
      <TrafficDot dir={1} color={GREEN} delay={CANARY_AT} />
      {[0, 1].map((i) => (
         <TrafficDot
            key={`g${i}`}
            dir={1}
            color={GREEN}
            delay={CUTOVER_AT + i * 0.55}
         />
      ))}
   </svg>
);

const RequestBars = ({ color }: { color: string }) =>
   [46, 30].map((w) => (
      <div key={w} style={{ ...bar, width: w, background: `${color}38` }} />
   ));

type EnvProps = { name: string; color: string; left: string; cycle: Cycle };
const EnvBox = ({ name, color, left, cycle }: EnvProps) => (
   <motion.div
      animate={{ opacity: cycle.opacity }}
      transition={{ ...LOOP, times: cycle.times }}
      style={{ ...ENV, ...box(color, 84, 56), left }}
   >
      <div style={{ ...ROW, gap: 4, padding: "6px 8px 4px" }}>
         <span style={dot(4, GREEN)} />
         <span style={tag(color)}>{name}</span>
      </div>
      {/* request bars: only the serving side drains as traffic leaves it */}
      {cycle.drain ? (
         <motion.div
            animate={cycle.drain}
            transition={{ ...LOOP, times: DRAIN_TIMES }}
            style={{ ...bars, transformOrigin: "left" }}
         >
            <RequestBars color={color} />
         </motion.div>
      ) : (
         <div style={bars}>
            <RequestBars color={color} />
         </div>
      )}
   </motion.div>
);

/* One clipped row: CANARY 30% slides up to 100% as CodeDeploy completes. */
const CanaryLabel = () => (
   <div style={{ ...HUB, ...CLIP, marginLeft: 12, marginTop: 27 }}>
      <motion.div
         animate={{
            y: [0, 0, 0, 0, -9, -9, -9, 0, 0],
            opacity: [0, 0, 1, 1, 1, 1, 0, 0, 0],
         }}
         transition={{ ...LOOP, times: CANARY_TIMES }}
         style={{ ...label, color: `${GREEN}cc`, lineHeight: "9px" }}
      >
         <div>CANARY 30%</div>
         <div>100%</div>
      </motion.div>
   </div>
);

const TerraformHint = ({ tint }: { tint: string }) => (
   <>
      <div
         style={{
            ...ABS,
            ...ROW,
            ...label,
            left: "6%",
            bottom: "9%",
            fontSize: 8,
            letterSpacing: 0.5,
            textTransform: "none",
         }}
      >
         <span style={{ color: `${tint}cc`, marginRight: 4 }}>$</span>
         <span style={{ color: "rgba(255,255,255,0.4)" }}>terraform apply</span>
         <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={BLINK}
            style={{ width: 4, height: 9, marginLeft: 3, background: tint }}
         />
      </div>
      <div
         style={{
            ...ABS,
            right: "7%",
            bottom: "10%",
            width: 30,
            height: 34,
            background: `${tint}18`,
            clipPath: HEX,
         }}
      />
   </>
);

const BlueGreenBody = ({ tint }: { tint: string }) => (
   <>
      <BlueGreenRail tint={tint} />
      <AlbNode tint={tint} />
      <EnvBox name="TG1 BLUE" color={tint} left="23.5%" cycle={TG1} />
      <EnvBox name="TG2 GREEN" color={GREEN} left="76.5%" cycle={TG2} />
      <CanaryLabel />
      <TerraformHint tint={tint} />
   </>
);

/* ---------------- pipeline: GitHub Actions -> ECR -> ECS ---------------- */

/* Chips sit at the percents matching the viewBox rail
   (x 88 = 26%, 170 = 50%, 246 = 72%; y 64 = 30%, 140 = 66%). */
const STAGE_TOP = "30%";
const ECR_LEFT = "72%";
const GATE = `1px solid ${GREEN}70`;
/* commit in flight: holds at each stage, drops to ECS, resets while hidden */
const HOP_T = [0, 0.06, 0.24, 0.36, 0.48, 0.58, 0.66, 0.74, 0.8, 0.82, 0.83, 1];
const HOP_X = [22, 22, 88, 88, 170, 170, 246, 246, 246, 246, 22, 22];
const HOP_Y = [64, 64, 64, 64, 64, 64, 64, 64, 140, 140, 64, 64];

const stage = (tint: string, w: number, h: number, left: string) => ({
   ...ABS,
   ...CENTER,
   ...box(tint, w, h),
   flexDirection: "column" as const,
   gap: 3,
   borderRadius: 4,
   top: STAGE_TOP,
   left,
   marginLeft: -w / 2,
   marginTop: -h / 2,
});

const PipelineRail = ({ tint }: { tint: string }) => (
   <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={SVG_LAYER}>
      <path
         d="M 22 64 H 246 V 140"
         fill="none"
         stroke={RAIL}
         vectorEffect="non-scaling-stroke"
      />
      {/* grows at the build chip: the commit became an image */}
      <motion.circle
         r={2.2}
         fill={tint}
         animate={{
            x: HOP_X,
            y: HOP_Y,
            opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            scale: [1, 1, 1, 1, 1, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1],
         }}
         transition={{ ...LOOP, times: HOP_T, ease: "easeInOut" }}
      />
   </svg>
);

const CommitDot = ({ tint }: { tint: string }) => (
   <motion.div
      animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
      transition={{ ...LOOP, times: [0, 0.06, 0.93, 1] }}
      style={{
         ...ABS,
         left: "6%",
         top: STAGE_TOP,
         margin: -3,
         ...dot(6, tint),
      }}
   />
);

/* coverage gate: border flashes green (an overlay, not borderColor), check pops */
const TestChip = ({ tint }: { tint: string }) => (
   <div style={stage(tint, 44, 18, "26%")}>
      <motion.div
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={{ ...LOOP, times: [0, 0.27, 0.3, 0.36, 0.4, 1] }}
         style={{ ...ABS, inset: -1, borderRadius: 4, border: GATE }}
      />
      <motion.span
         animate={{ scale: [0, 0, 1.3, 1, 1, 0], opacity: [0, 0, 1, 1, 1, 0] }}
         transition={{ ...LOOP, times: [0, 0.29, 0.32, 0.35, 0.95, 1] }}
         style={{ ...ABS, top: -2, right: -2, ...dot(3, GREEN) }}
      />
      <span style={tag(tint)}>PYTEST</span>
   </div>
);

/* two-stage image build: layers light bottom-up */
const BuildChip = ({ tint }: { tint: string }) => (
   <div style={stage(tint, 28, 22, "50%")}>
      {[2, 1, 0].map((i) => (
         <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.2, 1, 1, 0.2] }}
            transition={{
               ...LOOP,
               times: [0, 0.48 + i * 0.03, 0.52 + i * 0.03, 0.95, 1],
            }}
            style={{ width: 16, height: 2, borderRadius: 1, background: tint }}
         />
      ))}
   </div>
);

/* registry box pulses as the image lands; the tag chip hangs off the box so
   it tracks the box's px height at any slot width */
const EcrBox = ({ tint }: { tint: string }) => (
   <div style={stage(tint, 34, 26, ECR_LEFT)}>
      <motion.div
         animate={{ opacity: [0, 0, 1, 0, 0] }}
         transition={{ ...LOOP, times: [0, 0.66, 0.7, 0.76, 1] }}
         style={{ ...ABS, inset: 0, borderRadius: 3, background: `${tint}18` }}
      />
      <span style={{ ...tag(tint), position: "relative" }}>ECR</span>
      <motion.div
         animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, 4] }}
         transition={{ ...LOOP, times: [0, 0.67, 0.72, 0.95, 1] }}
         style={{ ...stage(tint, 44, 12, "50%"), top: "100%", marginTop: 4 }}
      >
         <span style={{ ...label, fontSize: 6.5, color: `${tint}b0` }}>
            :LATEST
         </span>
      </motion.div>
   </div>
);

/* neutral chrome panel for the service; tasks are pills inside it */
const ECS_PANEL = {
   ...ABS,
   right: "10%",
   top: "64%",
   width: 110,
   height: 36,
   borderRadius: 6,
   overflow: "hidden" as const,
   border: "1px solid rgba(255,255,255,0.10)",
   background: "rgba(255,255,255,0.03)",
};
const pill = {
   ...ABS,
   left: 37,
   top: 22,
   width: 36,
   height: 8,
   borderRadius: 4,
};
const status = { ...ABS, right: 7, top: 6, ...dot(3, DIM) };

/* rolling force-new-deployment: old task out left, new task in from the right */
const EcsPanel = ({ tint }: { tint: string }) => (
   <div style={ECS_PANEL}>
      <div style={{ ...tag(tint), padding: "5px 7px" }}>ECS</div>
      <span style={status} />
      <motion.span
         animate={{ opacity: [0, 0, 1, 1, 1, 0], scale: [1, 1, 1.4, 1, 1, 1] }}
         transition={{ ...LOOP, times: [0, 0.88, 0.91, 0.94, 0.985, 1] }}
         style={{ ...status, background: GREEN }}
      />
      <motion.div
         animate={{
            x: [0, 0, -56, -56, 0, 0, 0],
            opacity: [1, 1, 0, 0, 0, 0, 1],
         }}
         transition={{ ...LOOP, times: [0, 0.8, 0.88, 0.9, 0.91, 0.96, 1] }}
         style={{ ...pill, background: "rgba(255,255,255,0.22)" }}
      />
      <motion.div
         animate={{ x: [56, 56, 0, 0, 0, 56], opacity: [0, 0, 1, 1, 0, 0] }}
         transition={{ ...LOOP, times: [0, 0.8, 0.88, 0.96, 0.995, 1] }}
         style={{ ...pill, background: `${tint}b0` }}
      />
   </div>
);

const PipelineBody = ({ tint }: { tint: string }) => (
   <>
      <PipelineRail tint={tint} />
      <CommitDot tint={tint} />
      <TestChip tint={tint} />
      <BuildChip tint={tint} />
      <EcrBox tint={tint} />
      <EcsPanel tint={tint} />
   </>
);

/* ---------------- root ---------------- */

type Body = ({ tint }: { tint: string }) => React.JSX.Element;

const VARIANTS: Record<string, { Body: Body; glow: string }> = {
   default: { Body: BlueGreenBody, glow: "50% 0%" },
   pipeline: { Body: PipelineBody, glow: "72% 30%" },
};

const InfraScene = ({ tint, variant = "default" }: CoverSceneProps) => {
   const { Body, glow } = VARIANTS[variant] ?? VARIANTS.default;
   return (
      <div
         aria-hidden="true"
         style={{
            ...ABS,
            inset: 0,
            overflow: "hidden",
            background: `radial-gradient(ellipse at ${glow}, ${tint}14 0%, transparent 60%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
         }}
      >
         {/* hairline dot grid */}
         <div
            style={{
               ...ABS,
               inset: 0,
               opacity: 0.05,
               backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
               backgroundSize: "18px 18px",
            }}
         />
         <Body tint={tint} />
      </div>
   );
};

export default InfraScene;
