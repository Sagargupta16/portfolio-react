import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   VIEW_BOX,
   WHITE_04,
   WHITE_06,
   WHITE_08,
   WHITE_12,
   WHITE_28,
   WHITE_70,
   eases,
   labelStyle,
   loop,
   svgStyle,
   type Ease,
} from "./shared";

/*
 * Flappy Bird Game Unity: a Rigidbody2D bird glides right at constant speed
 * (CameraFollow makes the world scroll past), Space calls AddForce for an
 * impulse-then-gravity arc, every ObstacleScript post bobs vertically and
 * flips velocity on its own switchTime, and any OnCollisionEnter2D reloads
 * the scene, which is the loop reset.
 */

const CYCLE = 4.5;
const GROUND_Y = 78;
const SKY_BANDS = [18, 32];
const DIRT: [number, number][] = [
   [14, 86],
   [37, 92],
   [58, 84],
   [83, 90],
   [109, 85],
   [131, 93],
   [150, 88],
];

/* Single unpaired posts: hung from the sky or planted in the ground. */
interface Post {
   hung: boolean;
   h: number;
   /** switchTime: seconds per full up/down bob, different per post. */
   bob: number;
   delay: number;
}
const POSTS: Post[] = [
   { hung: true, h: 30, bob: 1.6, delay: 0.26 },
   { hung: false, h: 24, bob: 2.25, delay: 1.16 },
   { hung: true, h: 22, bob: 2.0, delay: 2.06 },
   { hung: false, h: 34, bob: 2.8, delay: 2.96 },
   { hung: true, h: 38, bob: 2.2, delay: 3.86 },
];
const POST_W = 8;
const OVERRUN = 10;
const BOB = 7;
const SWEEP_X = [170, -20];
const BOB_Y = [0, -BOB, 0, BOB, 0];
const BOB_EASE = eases(BOB_Y.length - 1, "linear");
const postRect = (p: Post) =>
   p.hung
      ? { y: -OVERRUN, height: p.h + OVERRUN }
      : { y: GROUND_Y - p.h, height: p.h + OVERRUN + 2 };

/* Bird.cs: fast rise on AddForce, accelerating fall under gravity. */
const BIRD = { x: 42, y: 41.5, w: 12, h: 9 };
const BIRD_TIMES = [0, 0.18, 0.24, 0.42, 0.6, 0.66, 0.84, 0.92, 0.95, 1];
const BIRD_Y = [0, 7, -11, -4, 8, -12, -3, 9, 0, 0];
const BIRD_ROT = [0, 14, -18, -4, 16, -20, -6, 18, 0, 0];
const BIRD_EASE: Ease[] = [
   "easeIn",
   "easeOut",
   "easeIn",
   "easeIn",
   "easeOut",
   "easeIn",
   "easeIn",
   "linear",
   "linear",
];
const FLAP_TIMES = [0, 0.17, 0.21, 0.3, 0.59, 0.63, 0.72, 1];
const FLAP_OPACITY = [0, 0, 0.55, 0, 0, 0.55, 0, 0];
/* OnCollisionEnter2D -> LoadScene: the dark reload covers the snap home. */
const RELOAD_TIMES = [0, 0.89, 0.92, 0.96, 1];
const RELOAD_OPACITY = [0, 0, 0.85, 0.85, 0];

const Ground = () => (
   <>
      {SKY_BANDS.map((y) => (
         <line
            key={y}
            x1={0}
            y1={y}
            x2={160}
            y2={y}
            stroke={WHITE_04}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      <line
         x1={0}
         y1={GROUND_Y}
         x2={160}
         y2={GROUND_Y}
         stroke={`${GREEN}aa`}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <rect x={0} y={GROUND_Y + 1} width={160} height={2} fill={WHITE_08} />
      {DIRT.map(([x, y]) => (
         <rect
            key={`${x}:${y}`}
            x={x}
            y={y}
            width={2}
            height={2}
            fill={WHITE_12}
         />
      ))}
   </>
);

/* ObstacleScript: sweep past the camera, bob with a hard velocity flip. */
const Posts = () => (
   <>
      {POSTS.map((p) => (
         <motion.rect
            key={p.delay}
            x={0}
            {...postRect(p)}
            width={POST_W}
            rx={2.5}
            fill={WHITE_06}
            stroke={WHITE_28}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
            initial={{ x: SWEEP_X[0], y: 0 }}
            animate={{ x: SWEEP_X, y: BOB_Y }}
            transition={{
               x: {
                  duration: CYCLE,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay,
               },
               y: { duration: p.bob, repeat: Infinity, ease: BOB_EASE },
            }}
         />
      ))}
   </>
);

const Bird = ({ tint }: { tint: string }) => (
   <motion.g
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: BIRD_Y, rotate: BIRD_ROT }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         times: BIRD_TIMES,
         ease: BIRD_EASE,
      }}
   >
      <rect
         x={BIRD.x}
         y={BIRD.y}
         width={BIRD.w}
         height={BIRD.h}
         rx={4}
         fill={tint}
      />
      <circle cx={BIRD.x + 9} cy={BIRD.y + 3.2} r={1.7} fill={WHITE_70} />
      <circle cx={BIRD.x + 9.5} cy={BIRD.y + 3.2} r={0.8} fill={INK} />
   </motion.g>
);

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
            left: "32%",
            top: "45%",
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
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Ground />
         <Posts />
         <Bird tint={tint} />
      </svg>
      <span style={{ ...labelStyle, left: "5%", top: "4%" }}>RIGIDBODY2D</span>
      <motion.span
         initial={{ opacity: 0.2 }}
         animate={{ opacity: [0.2, 0.45, 0.2] }}
         transition={{ duration: 2, repeat: Infinity, ease: eases(2) }}
         style={{ ...labelStyle, left: "60%", top: "8%" }}
      >
         SWITCHTIME
      </motion.span>
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: FLAP_OPACITY }}
         transition={loop(CYCLE, FLAP_TIMES, "linear")}
         style={{ ...labelStyle, left: "37%", top: "36%", color: tint }}
      >
         ADDFORCE
      </motion.span>
      <Reload />
   </>
);

export default Flappy;
