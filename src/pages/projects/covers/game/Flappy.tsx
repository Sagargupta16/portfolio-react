import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   VIEW_BOX,
   WHITE_03,
   WHITE_04,
   WHITE_05,
   WHITE_08,
   WHITE_20,
   WHITE_70,
   beats,
   clock,
   eases,
   labelStyle,
   loop,
   svgStyle,
   washStyle,
   type Ease,
} from "./shared";

/*
 * Flappy Bird Game Unity: Bird.cs sets a constant rightward velocity and
 * CameraFollow pins the camera to it, so the world slides past a bird that
 * only moves up and down. Space calls AddForce for a sharp rise, gravity
 * pulls it back. Every post is a lone ObstacleScript, hung from the sky or
 * planted in the ground; Switch runs at t = 0 and then every switchTime, so
 * each post sinks and returns at its own speed. The third rise meets a post,
 * OnCollisionEnter2D fires and LoadScene restarts the run.
 */

const CYCLE = 4.5;
const t = clock(CYCLE);
const at = beats(CYCLE);
const GROUND_Y = 80;

/* Bird: fixed on screen; the world scrolls at its speed. */
const BIRD = { x: 48, y: 46, w: 12, h: 9 };
const WORLD_SPEED = 190 / CYCLE;
const FLAPS = [0.6, 1.8, 3];
const HIT_AT = 3.25;
const BIRD_TIMES = [0, 0.6, 0.9, 1.8, 2.1, 3, HIT_AT, 3.7, 3.72, CYCLE].map(t);
const BIRD_Y = [0, 6, -8, 6, -9, 5, -10, -10, 0, 0];
const BIRD_ROT = [0, 12, -16, 14, -18, 12, -20, -20, 0, 0];
const BIRD_EASE: Ease[] = [
   "easeIn",
   "easeOut",
   "easeIn",
   "easeOut",
   "easeIn",
   "easeOut",
   "linear",
   "linear",
   "linear",
];
const birdMotion = (delay = 0) => ({
   duration: CYCLE,
   repeat: Infinity,
   times: BIRD_TIMES,
   ease: BIRD_EASE,
   delay,
});
/* The path the bird just flew, already scrolled left at world speed. */
const TRAIL = [7, 12, 17].map((dx, i) => ({
   dx,
   delay: dx / WORLD_SPEED,
   alpha: 0.5 - i * 0.15,
}));

/*
 * ObstacleScript posts. `pass` is when the post crosses the bird; switchTime
 * makes each bob period (2 x switchTime) a divisor of the cycle, so every
 * post meets the bird at the same height on every loop.
 */
interface Post {
   id: string;
   hung: boolean;
   h: number;
   pass: number;
   switchTime: number;
   sink: number;
}
const POSTS: Post[] = [
   { id: "a", hung: false, h: 22, pass: 0.75, switchTime: 0.75, sink: 5 },
   { id: "b", hung: true, h: 24, pass: 1.65, switchTime: 1.125, sink: 7 },
   { id: "c", hung: false, h: 26, pass: 2.55, switchTime: 0.75, sink: 4 },
   { id: "d", hung: true, h: 28.5, pass: 3.3, switchTime: 2.25, sink: 6 },
   { id: "e", hung: true, h: 34, pass: 4.2, switchTime: 1.125, sink: 5 },
];
const POST_W = 8;
const ENTER = 170;
const EXIT = -20;
const SPAN = ENTER - EXIT;
/* Left edge sweep, wrapping from EXIT back to ENTER off screen. */
const sweep = (p: Post) => {
   const atPass = BIRD.x - POST_W / 2;
   const start =
      EXIT + ((((atPass + WORLD_SPEED * p.pass - EXIT) % SPAN) + SPAN) % SPAN);
   const wrap = t((start - EXIT) / WORLD_SPEED);
   return {
      x: [start, EXIT, ENTER, start],
      times: [0, wrap, Math.min(wrap + 0.0005, 1), 1],
   };
};
const postRect = (p: Post) =>
   p.hung
      ? { y: -10, height: p.h + 10 }
      : { y: GROUND_Y - p.h, height: p.h + 10 };
const SINK_TIMES = [0, 0.5, 1];
const SINK_EASE = eases(2, "linear");

/* AddForce flashes on each Space press; LoadScene darkens the restart. */
const FLAP_TIMES = [
   0,
   ...FLAPS.flatMap((s) => [t(s - 0.02), t(s + 0.03), t(s + 0.3)]),
   1,
];
const FLAP_OPACITY = [0, ...FLAPS.flatMap(() => [0, 1, 0]), 0];
const RING_TIMES = at(HIT_AT - 0.02, HIT_AT + 0.08, HIT_AT + 0.45);
const RELOAD_TIMES = at(3.4, 3.5, 4.1);
const RELOAD_OPACITY = [0, 0, 0.82, 0.82, 0];

/* Distant hills, the one static back layer. */
const HILLS_D =
   "M0 66C14 60 26 60 40 64S66 70 80 64 106 57 120 62 146 69 160 63";
const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Backdrop = () => (
   <>
      <line x1={0} y1={14} x2={160} y2={14} stroke={WHITE_04} {...hairline} />
      <path d={HILLS_D} stroke={WHITE_05} {...hairline} />
   </>
);

const Ground = () => (
   <>
      <rect x={0} y={GROUND_Y} width={160} height={20} fill={INK} />
      <rect x={0} y={GROUND_Y} width={160} height={20} fill={WHITE_03} />
      <line
         x1={0}
         y1={GROUND_Y}
         x2={160}
         y2={GROUND_Y}
         stroke={WHITE_20}
         {...hairline}
      />
      <line
         x1={0}
         y1={GROUND_Y + 2.5}
         x2={160}
         y2={GROUND_Y + 2.5}
         stroke={WHITE_08}
         {...hairline}
      />
   </>
);

/* One ObstacleScript post: scrolls with the world, sinks on switchTime. */
const PostShape = ({ post }: { post: Post }) => {
   const s = sweep(post);
   const rect = postRect(post);
   return (
      <motion.g
         initial={{ x: s.x[0], y: 0 }}
         animate={{ x: s.x, y: [0, post.sink, 0] }}
         transition={{
            x: loop(CYCLE, s.times, "linear"),
            y: {
               duration: post.switchTime * 2,
               repeat: Infinity,
               times: SINK_TIMES,
               ease: SINK_EASE,
            },
         }}
      >
         <rect
            x={0}
            {...rect}
            width={POST_W}
            rx={2}
            fill={WHITE_04}
            stroke={WHITE_20}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
         <line
            x1={POST_W * 0.35}
            y1={rect.y + 2}
            x2={POST_W * 0.35}
            y2={rect.y + rect.height - 2}
            stroke={WHITE_08}
            {...hairline}
         />
      </motion.g>
   );
};

const Bird = ({ tint }: { tint: string }) => (
   <motion.g
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: BIRD_Y, rotate: BIRD_ROT }}
      transition={birdMotion()}
   >
      <rect
         x={BIRD.x - BIRD.w / 2}
         y={BIRD.y - BIRD.h / 2}
         width={BIRD.w}
         height={BIRD.h}
         rx={4}
         fill={tint}
      />
      <path
         d={`M${BIRD.x + 5.6} ${BIRD.y - 0.4}L${BIRD.x + 8} ${BIRD.y + 0.8}L${BIRD.x + 5.6} ${BIRD.y + 2}Z`}
         fill={WHITE_70}
      />
      <circle cx={BIRD.x + 3} cy={BIRD.y - 1.4} r={1.7} fill={WHITE_70} />
      <circle cx={BIRD.x + 3.5} cy={BIRD.y - 1.4} r={0.8} fill={INK} />
   </motion.g>
);

const Trail = ({ tint }: { tint: string }) => (
   <>
      {TRAIL.map((dot) => (
         <motion.circle
            key={dot.dx}
            cx={BIRD.x - BIRD.w / 2 - dot.dx + 6}
            cy={BIRD.y}
            r={0.9}
            fill={tint}
            opacity={dot.alpha}
            initial={{ y: 0 }}
            animate={{ y: BIRD_Y }}
            transition={birdMotion(dot.delay)}
         />
      ))}
   </>
);

/* OnCollisionEnter2D: the bird's head meets post d's foot. */
const HitRing = () => (
   <motion.circle
      cx={BIRD.x + 2}
      cy={BIRD.y - 15}
      r={3.5}
      stroke={AMBER}
      {...hairline}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0, 0.9, 0, 0], scale: [0.5, 0.5, 1, 1.8, 1.8] }}
      transition={loop(CYCLE, RING_TIMES)}
   />
);

const flapLabel: CSSProperties = {
   ...labelStyle,
   left: `${((BIRD.x - 8) / 160) * 100}%`,
   top: "62%",
};

const Reload = () => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: RELOAD_OPACITY }}
      transition={loop(CYCLE, RELOAD_TIMES, "linear")}
      style={{ position: "absolute", inset: 0, background: INK }}
   >
      <span
         style={{
            ...labelStyle,
            left: "50%",
            top: "46%",
            transform: "translate(-50%, -50%)",
            color: WHITE_70,
         }}
      >
         LOADSCENE
      </span>
   </motion.div>
);

const Flappy = ({ tint }: { tint: string }) => (
   <>
      <div style={washStyle(tint, "30% 46%")} />
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Backdrop />
         {POSTS.map((post) => (
            <PostShape key={post.id} post={post} />
         ))}
         <Ground />
         <Trail tint={tint} />
         <Bird tint={tint} />
         <HitRing />
      </svg>
      <span style={{ ...labelStyle, left: "8%", top: "8%" }}>RIGIDBODY2D</span>
      <span style={{ ...labelStyle, right: "8%", top: "8%" }}>SWITCHTIME</span>
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: FLAP_OPACITY }}
         transition={loop(CYCLE, FLAP_TIMES)}
         style={{ ...flapLabel, color: tint }}
      >
         ADDFORCE
      </motion.span>
      <Reload />
   </>
);

export default Flappy;
