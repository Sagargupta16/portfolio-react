import { motion } from "motion/react";
import {
   GREEN,
   LINEAR,
   WHITE_30,
   boxAt,
   curveH,
   dotStyle,
   label,
   labelAt,
   loop,
   panel,
   tintPanel,
} from "./tokens";
import type { Point, TintProps } from "./tokens";
import { FadeLayer, Packet, Stage, StageSvg, Wires } from "./primitives";
import type { Fade, Track } from "./primitives";

/*
 * Blue Green AWS Terraform: CodeDeploy ECS blue/green behind one ALB, two
 * full deployments per 6 s loop, because CodeDeploy alternates target groups.
 * Each half: replacement tasks start in the idle target group, a test
 * listener probe (white) reaches it, the TimeBasedCanary sends one prod
 * request in two there while CANARY lights, then the prod listener switches
 * (the knob on the ALB), every request follows, and the old tasks drain and
 * terminate. The second half mirrors the first, so the loop closes on the
 * state it opened with. 10 animated nodes.
 */

const CYCLE = 6;
const HALF = CYCLE / 2;

const ALB: Point = [28, 48];
const TG1: Point = [126, 20];
const TG2: Point = [126, 76];
const DX = TG1[0] - ALB[0];
const UP = TG1[1] - ALB[1];
const DOWN = TG2[1] - ALB[1];
const ROUTES = [curveH(ALB, TG1), curveH(ALB, TG2)];

/* Seconds within one half: the canary window, then the full shift. */
const CANARY_FROM = 0.7;
const SHIFT_AT = 1.6;
const SWITCH = 0.25;

/* ---------------- request trips ---------------- */

/* seconds -> fraction of the cycle, clamped against float drift past 1 */
const frac = (s: number) => Math.min(1, s / CYCLE);

const PERIOD = 1.5;
const TRAVEL = 0.75;
const HIDDEN = 0.04;

interface Trip {
   at: number;
   dy: number;
}

/* Old and new target group per half: TG 1 serves first, then TG 2. */
const sides = (s: number) => (s < HALF ? [UP, DOWN] : [DOWN, UP]);

/* The canary carrier takes the new side inside the window; everyone does
   after the shift. */
const prodTrip = (at: number, carrier: boolean): Trip => {
   const [oldSide, newSide] = sides(at);
   const local = at % HALF;
   const shifted = local >= SHIFT_AT;
   const canary = carrier && local >= CANARY_FROM;
   return { at, dy: shifted || canary ? newSide : oldSide };
};

const starts = (offset: number) =>
   Array.from(
      { length: Math.round(CYCLE / PERIOD) },
      (_, i) => offset + i * PERIOD,
   );

const TRIPS_A = starts(0).map((at) => prodTrip(at, false));
const TRIPS_B = starts(PERIOD / 2).map((at) => prodTrip(at, true));
/* test listener: one probe into the replacement tasks per half */
const TRIPS_PROBE = [0.3, HALF + 0.3].map((at) => ({
   at,
   dy: sides(at)[1],
}));

/*
 * Each trip leaves from under the ALB and lands under a target group panel.
 * Between trips the packet waits hidden at its last stop and snaps back
 * under the ALB just before the next trip, so no reset is ever visible.
 */
const tripTrack = (trips: Trip[]): Track => {
   const x = [0];
   const y = [0];
   const times = [0];
   const push = (t: number, px: number, py: number) => {
      times.push(frac(t));
      x.push(px);
      y.push(py);
   };
   let last = { x: 0, y: 0 };
   for (const { at, dy } of trips) {
      if (at > HIDDEN) push(at - HIDDEN, last.x, last.y);
      push(at, 0, 0);
      push(at + TRAVEL, DX, dy);
      last = { x: DX, y: dy };
   }
   push(CYCLE, last.x, last.y);
   return { x, y, times, xEase: LINEAR };
};

const tripFade = (trips: Trip[]): Fade => {
   const opacity = [0];
   const times = [0];
   const push = (t: number, o: number) => {
      times.push(frac(t));
      opacity.push(o);
   };
   for (const { at } of trips) {
      push(at, 0);
      push(at + 0.06, 1);
      push(at + TRAVEL - 0.06, 1);
      push(at + TRAVEL, 0);
   }
   push(CYCLE, 0);
   return { opacity, times };
};

const Requests = ({ tint }: TintProps) => (
   <>
      <Packet
         from={ALB}
         color={tint}
         dir="right"
         cycle={CYCLE}
         track={tripTrack(TRIPS_A)}
         fade={tripFade(TRIPS_A)}
      />
      <Packet
         from={ALB}
         color={tint}
         dir="right"
         cycle={CYCLE}
         track={tripTrack(TRIPS_B)}
         fade={tripFade(TRIPS_B)}
      />
      <Packet
         from={ALB}
         color="rgba(255,255,255,0.8)"
         dir="right"
         cycle={CYCLE}
         track={tripTrack(TRIPS_PROBE)}
         fade={tripFade(TRIPS_PROBE)}
      />
   </>
);

/* ---------------- ALB with its prod listener switch ---------------- */

const SWITCH_TIMES = [
   0,
   frac(SHIFT_AT),
   frac(SHIFT_AT + SWITCH),
   frac(HALF + SHIFT_AT),
   frac(HALF + SHIFT_AT + SWITCH),
   1,
];
const KNOB_Y = [-8, -8, 8, 8, -8, -8];
const PORT = {
   ...dotStyle(3, WHITE_30),
   position: "absolute" as const,
   right: 7,
};

const AlbNode = ({ tint }: TintProps) => (
   <div
      style={{
         ...boxAt(ALB, 50, 38),
         ...tintPanel(tint, 8),
         display: "flex",
         alignItems: "center",
         paddingLeft: 9,
      }}
   >
      <span style={{ ...label, color: `${tint}ee` }}>ALB</span>
      <div style={{ ...PORT, top: 8.5 }} />
      <div style={{ ...PORT, top: 24.5 }} />
      {/* the prod listener's target group: up is TG 1, down is TG 2 */}
      <motion.div
         initial={{ y: -8 }}
         animate={{ y: KNOB_Y }}
         transition={loop(CYCLE, SWITCH_TIMES)}
         style={{
            ...dotStyle(5, tint),
            position: "absolute",
            right: 6,
            top: 15.5,
         }}
      />
   </div>
);

/* ---------------- target groups ---------------- */

/* Serving: TG 1 first, handing over at the shift and taking back at the
   mirror shift. */
const SERVE_TIMES = SWITCH_TIMES;
const SERVE_TG1 = [1, 1, 0, 0, 1, 1];
const SERVE_TG2 = [0, 0, 1, 1, 0, 0];

/* Replacement or draining (white): up for the canary, down at terminate. */
const IDLE_TG1 = {
   opacity: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
   times: [
      0,
      frac(SHIFT_AT),
      frac(SHIFT_AT + SWITCH),
      frac(SHIFT_AT + 0.6),
      frac(SHIFT_AT + 0.9),
      frac(HALF),
      frac(HALF + 0.3),
      frac(HALF + SHIFT_AT),
      frac(HALF + SHIFT_AT + SWITCH),
      1,
   ],
};
const IDLE_TG2 = {
   opacity: [0, 1, 1, 0, 0, 1, 1, 0, 0],
   times: [
      0,
      frac(0.3),
      frac(SHIFT_AT),
      frac(SHIFT_AT + SWITCH),
      frac(HALF + SHIFT_AT),
      frac(HALF + SHIFT_AT + SWITCH),
      frac(HALF + SHIFT_AT + 0.6),
      frac(HALF + SHIFT_AT + 0.9),
      1,
   ],
};

const TASKS = [8, 32];
const pill = (left: number, background: string) => (
   <div
      key={left}
      style={{
         position: "absolute",
         left,
         top: 18,
         width: 20,
         height: 8,
         borderRadius: 4,
         background,
      }}
   />
);

interface GroupProps extends TintProps {
   point: Point;
   name: string;
   serve: number[];
   idle: { opacity: number[]; times: number[] };
}

const TargetGroup = ({ tint, point, name, serve, idle }: GroupProps) => (
   <div style={{ ...boxAt(point, 68, 32), ...panel(8) }}>
      <span style={{ ...label, position: "absolute", left: 8, top: 6 }}>
         {name}
      </span>
      {TASKS.map((left) => pill(left, "rgba(255,255,255,0.06)"))}
      <FadeLayer cycle={CYCLE} fade={idle}>
         {TASKS.map((left) => pill(left, "rgba(255,255,255,0.4)"))}
      </FadeLayer>
      <FadeLayer cycle={CYCLE} fade={{ opacity: serve, times: SERVE_TIMES }}>
         {TASKS.map((left) => pill(left, tint))}
         <div
            style={{
               ...dotStyle(4, GREEN),
               position: "absolute",
               right: 8,
               top: 7,
            }}
         />
      </FadeLayer>
   </div>
);

/* ---------------- canary ---------------- */

const CANARY = {
   opacity: [0.3, 0.3, 1, 1, 0.3, 0.3, 1, 1, 0.3, 0.3],
   times: [
      0,
      frac(CANARY_FROM),
      frac(CANARY_FROM + 0.15),
      frac(SHIFT_AT - 0.15),
      frac(SHIFT_AT),
      frac(HALF + CANARY_FROM),
      frac(HALF + CANARY_FROM + 0.15),
      frac(HALF + SHIFT_AT - 0.15),
      frac(HALF + SHIFT_AT),
      1,
   ],
};

const CanaryLabel = ({ tint }: TintProps) => (
   <span style={labelAt([(ALB[0] + TG1[0]) / 2 + 2, ALB[1]], -3.5, tint)}>
      <motion.span
         initial={{ opacity: CANARY.opacity[0] }}
         animate={{ opacity: CANARY.opacity }}
         transition={loop(CYCLE, CANARY.times)}
         style={{ display: "block" }}
      >
         CANARY
      </motion.span>
   </span>
);

export default function BlueGreen({ tint }: TintProps) {
   return (
      <Stage tint={tint} focus={[104, ALB[1]]} backdrop="grid" drift>
         <StageSvg>
            <Wires paths={ROUTES} />
         </StageSvg>
         <Requests tint={tint} />
         <AlbNode tint={tint} />
         <TargetGroup
            tint={tint}
            point={TG1}
            name="TG 1"
            serve={SERVE_TG1}
            idle={IDLE_TG1}
         />
         <TargetGroup
            tint={tint}
            point={TG2}
            name="TG 2"
            serve={SERVE_TG2}
            idle={IDLE_TG2}
         />
         <CanaryLabel tint={tint} />
      </Stage>
   );
}
