import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
   BASE_DARK,
   GREEN,
   LINEAR,
   NON_SCALING,
   WHITE_18,
   WHITE_30,
   appear,
   boxAt,
   curveH,
   dotStyle,
   label,
   labelAt,
   loop,
   panel,
   pctX,
   pctY,
   sweep,
   tintPanel,
} from "./tokens";
import type { Point, TintProps } from "./tokens";
import { FadeLayer, Packet, Stage, StageSvg, Wires } from "./primitives";

/*
 * AWS DevOps Infrastructure (DevOps-AWS-FARM): the GitHub Actions run graph
 * of main.yml, then the AWS half of deploy.yml.
 * A push flows through the job graph while each column ticks green in
 * dependency order: black/flake8 and eslint/prettier, then pytest with
 * coverage and the Vite client build, then sonarQube-scan, then
 * build-and-publish. The image leaves for ECR, drops into the ECS service,
 * and update-service --force-new-deployment rolls the task: the new task
 * slides in, the old one drains out, and services-stable lights the service.
 * One 6 s loop, 12 animated nodes.
 */

const CYCLE = 6;
const RISE = 0.03;

const COMMIT: Point = [13, 43];
const LINT_PY: Point = [32, 22];
const LINT_NODE: Point = [32, 64];
const PYTEST: Point = [58, 22];
const CLIENT: Point = [58, 64];
const SONAR: Point = [84, 43];
const PUBLISH: Point = [108, 43];
const ECR: Point = [134, 22];
const ECS: Point = [134, 72];

const JOB = { w: 32, h: 12 };

const GRAPH = [
   curveH(COMMIT, LINT_PY),
   curveH(COMMIT, LINT_NODE),
   curveH(LINT_PY, PYTEST),
   curveH(LINT_NODE, CLIENT),
   curveH(PYTEST, SONAR),
   curveH(CLIENT, SONAR),
   curveH(SONAR, PUBLISH),
];
const DEPLOY = [curveH(PUBLISH, ECR), `M ${ECR[0]} ${ECR[1]} V ${ECS[1]}`];

/* ---------------- workflow graph ---------------- */

const RUN = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.01, 0.05, 0.5, 0.56, 1],
};

const Wiring = ({ tint }: TintProps) => (
   <StageSvg>
      <Wires paths={[...GRAPH, ...DEPLOY]} />
      {/* the run in progress: px dashes along every job edge */}
      <motion.path
         d={GRAPH.join(" ")}
         fill="none"
         stroke={tint}
         strokeDasharray="3 6"
         vectorEffect={NON_SCALING}
         initial={{ strokeDashoffset: 0, opacity: 0 }}
         animate={{ strokeDashoffset: [0, -144], opacity: RUN.opacity }}
         transition={{
            strokeDashoffset: sweep(CYCLE),
            opacity: loop(CYCLE, RUN.times),
         }}
      />
   </StageSvg>
);

/* A queued job: grey status dot and a name stroke. */
const Job = ({ at }: { at: Point }) => (
   <div style={{ ...boxAt(at, JOB.w, JOB.h), ...panel(6) }}>
      <div
         style={{
            ...dotStyle(4, WHITE_30),
            position: "absolute",
            left: 4,
            top: 3,
         }}
      />
      <div
         style={{
            position: "absolute",
            left: 12,
            top: 4.5,
            width: 13,
            height: 1,
            background: WHITE_18,
         }}
      />
   </div>
);

/* The green success dot laid over a job's grey one. */
const passDot = ([x, y]: Point) => (
   <div
      key={`${x},${y}`}
      style={{
         ...dotStyle(4, GREEN),
         position: "absolute",
         left: `calc(${pctX(x)} - ${JOB.w / 2 - 5}px)`,
         top: `calc(${pctY(y)} - ${JOB.h / 2 - 4}px)`,
      }}
   />
);

/* One node per graph column: its jobs succeed together. */
const Column = ({ at, jobs }: { at: number; jobs: Point[] }) => (
   <FadeLayer cycle={CYCLE} fade={appear(at, RISE)}>
      {jobs.map(passDot)}
   </FadeLayer>
);

const Graph = ({ tint }: TintProps) => (
   <>
      <div
         style={{
            ...boxAt(COMMIT, 9, 9),
            borderRadius: "50%",
            border: `2px solid ${tint}`,
            background: BASE_DARK,
         }}
      />
      {[LINT_PY, LINT_NODE, PYTEST, CLIENT, SONAR, PUBLISH].map((p) => (
         <Job key={`${p[0]},${p[1]}`} at={p} />
      ))}
      <span style={labelAt(PYTEST, -JOB.h / 2 - 13)}>PYTEST</span>
      <span style={labelAt(SONAR, -JOB.h / 2 - 13)}>SONAR</span>
      <Column at={0.13} jobs={[LINT_PY, LINT_NODE]} />
      <Column at={0.27} jobs={[PYTEST, CLIENT]} />
      <Column at={0.39} jobs={[SONAR]} />
      <Column at={0.49} jobs={[PUBLISH]} />
   </>
);

/* ---------------- ECR and ECS ---------------- */

const Image = ({ tint }: TintProps) => (
   <>
      {/* docker push: build-and-publish -> ECR */}
      <Packet
         from={PUBLISH}
         color={tint}
         dir="right"
         cycle={CYCLE}
         track={{
            x: [0, 0, ECR[0] - PUBLISH[0], ECR[0] - PUBLISH[0]],
            y: [0, 0, ECR[1] - PUBLISH[1], ECR[1] - PUBLISH[1]],
            times: [0, 0.52, 0.6, 1],
            xEase: LINEAR,
         }}
         fade={{
            opacity: [0, 0, 1, 1, 0, 0],
            times: [0, 0.52, 0.54, 0.59, 0.61, 1],
         }}
      />
      {/* the ECS task definition picks the image up */}
      <Packet
         from={ECR}
         color={tint}
         dir="down"
         cycle={CYCLE}
         track={{
            y: [0, 0, ECS[1] - ECR[1], ECS[1] - ECR[1]],
            times: [0, 0.66, 0.74, 1],
         }}
         fade={{
            opacity: [0, 0, 1, 1, 0, 0],
            times: [0, 0.66, 0.68, 0.73, 0.75, 1],
         }}
      />
   </>
);

const LANDED = { opacity: [0, 0, 1, 0, 0], times: [0, 0.6, 0.63, 0.7, 1] };

const Registry = ({ tint }: TintProps) => (
   <div
      style={{
         ...boxAt(ECR, 36, 24),
         ...tintPanel(tint, 6),
         display: "grid",
         placeItems: "center",
      }}
   >
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: LANDED.opacity }}
         transition={loop(CYCLE, LANDED.times)}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 6,
            border: `1px solid ${tint}`,
            background: `${tint}26`,
         }}
      />
      <span style={{ ...label, position: "relative", color: `${tint}ee` }}>
         ECR
      </span>
   </div>
);

/* Rolling task swap; both pills share the slot, so the new task cross-fades
   back to the steady colour as the loop closes. */
const OLD_X = {
   x: [0, 0, -18, -18, 0, 0],
   times: [0, 0.76, 0.84, 0.9, 0.95, 1],
};
const OLD_FADE = {
   opacity: [1, 1, 0, 0, 1, 1],
   times: [0, 0.76, 0.84, 0.95, 0.99, 1],
};
const NEW_X = { x: [21, 21, 0, 0], times: [0, 0.74, 0.82, 1] };
const NEW_FADE = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.74, 0.78, 0.95, 0.99, 1],
};
const STABLE = appear(0.84, RISE);

const TASK = {
   position: "absolute" as const,
   left: 16,
   top: 18,
   width: 21,
   height: 7,
   borderRadius: 3.5,
};

const Task = ({
   x,
   fade,
   color,
}: {
   x: { x: number[]; times: number[] };
   fade: { opacity: number[]; times: number[] };
   color: string;
}) => (
   <motion.div
      initial={{ x: x.x[0], opacity: fade.opacity[0] }}
      animate={{ x: x.x, opacity: fade.opacity }}
      transition={{ x: loop(CYCLE, x.times), opacity: loop(CYCLE, fade.times) }}
      style={{ ...TASK, background: color }}
   />
);

const Service = ({ tint, children }: TintProps & { children: ReactNode }) => (
   <div
      style={{
         ...boxAt(ECS, 52, 31),
         ...panel(8),
         overflow: "hidden",
      }}
   >
      <span style={{ ...label, position: "absolute", left: 7, top: 6 }}>
         ECS
      </span>
      <div
         style={{
            ...dotStyle(4, WHITE_30),
            position: "absolute",
            right: 7,
            top: 7,
         }}
      />
      <Task x={OLD_X} fade={OLD_FADE} color="rgba(255,255,255,0.4)" />
      <Task x={NEW_X} fade={NEW_FADE} color={tint} />
      {children}
   </div>
);

/* aws ecs wait services-stable */
const StableDot = () => (
   <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: STABLE.opacity, scale: [0.4, 0.4, 1, 1, 1, 0.4] }}
      transition={loop(CYCLE, STABLE.times)}
      style={{
         ...dotStyle(4, GREEN),
         position: "absolute",
         right: 7,
         top: 7,
      }}
   />
);

export default function Pipeline({ tint }: Readonly<TintProps>) {
   return (
      <Stage tint={tint} focus={PUBLISH} backdrop="grid" drift>
         <Wiring tint={tint} />
         <Image tint={tint} />
         <Graph tint={tint} />
         <Registry tint={tint} />
         <Service tint={tint}>
            <StableDot />
         </Service>
      </Stage>
   );
}
