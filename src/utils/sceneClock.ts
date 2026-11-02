import {
   cancelFrame,
   frame,
   frameData,
   time,
   type ValueAnimationOptions,
} from "motion/react";

/*
 * One shared 60 Hz clock for the scene loops (project covers, experience
 * scenes, Focus Areas art) on screens faster than 85 Hz (90 Hz and up).
 *
 * Those loops animate SVG parts, which Chrome cannot hand to the compositor,
 * so it repaints the page for them on every display refresh: 240 times a
 * second on a 240 Hz panel, a full CPU core while Projects is on screen. On
 * the shared clock they update 60 times a second, the rate a 60 Hz screen
 * shows them at. Screens at 85 Hz or less (60 and 75 Hz panels) keep Motion's
 * own frame loop, so nothing changes there, and scrolling, hover and every
 * other animation keep the display's full rate everywhere. While the page is
 * hidden the clock stops, and it starts again when the page is shown.
 *
 * Motion's JS loops join through `transition.driver` (sceneDriver); scene
 * slots step their WAAPI loops on the same ticks with useSceneClock.
 */

type Driver = NonNullable<ValueAnimationOptions["driver"]>;
type Update = Parameters<Driver>[0];

const STEP_MS = 1000 / 60;
// The cut sits at 85 Hz, well clear of 75 Hz: a 75 Hz frame is 13.33 ms, and
// timestamps rounded to 0.1 ms can read it as 13.3 ms, under 1000 / 75.
const HIGH_REFRESH_MS = 1000 / 85;
const SAMPLE_FRAMES = 12;

let decide: (active: boolean) => void = () => {};
let active = false;
let decided = false;

/* Resolves once the display rate is known; true means the clock is in use. */
export const sceneClockReady = new Promise<boolean>((resolve) => {
   decide = (value) => {
      active = value;
      decided = true;
      resolve(value);
   };
});

/* True once the display is known to keep Motion's own frame loop. */
export const isSceneClockOff = () => decided && !active;

// The shortest gap between frames is the refresh interval; load jank only
// makes gaps longer, which errs towards leaving Motion's loop in place.
if (typeof window === "undefined") {
   decide(false);
} else {
   const stamps: number[] = [];
   const sample = (stamp: number) => {
      stamps.push(stamp);
      if (stamps.length <= SAMPLE_FRAMES) {
         requestAnimationFrame(sample);
         return;
      }
      const gaps = stamps.slice(1).map((s, i) => s - stamps[i]);
      decide(Math.min(...gaps) < HIGH_REFRESH_MS);
   };
   requestAnimationFrame(sample);
}

const subscribers = new Map<Update, boolean>();
let timer = 0;
let due = 0;
let tickTime: number | undefined;

const run = () => {
   // Hidden page: stop the chain here; resumeOnShow starts it again.
   if (document.hidden) {
      timer = 0;
      return;
   }
   const now = performance.now();
   due += STEP_MS;
   // fell behind (a long task or a throttled timer): resume from now
   if (due < now) due = now + STEP_MS;
   timer = window.setTimeout(run, due - now);
   tickTime = now;
   for (const [update, keepAlive] of subscribers) {
      if (!keepAlive) subscribers.delete(update);
      update(now);
   }
   tickTime = undefined;
   if (!subscribers.size) {
      window.clearTimeout(timer);
      timer = 0;
   }
};

const startClock = () => {
   due = performance.now() + STEP_MS;
   timer = window.setTimeout(run, STEP_MS);
};

/* Calls `update` on every tick; `keepAlive: false` runs it once. */
export const onSceneTick = (update: Update, keepAlive = true) => {
   subscribers.set(update, keepAlive);
   if (!timer) startClock();
   return () => {
      subscribers.delete(update);
   };
};

// One listener for the page's lifetime: when the page is shown again, the
// chain that run stopped while it was hidden starts over.
const resumeOnShow = () => {
   if (!document.hidden && subscribers.size && !timer) startClock();
};
if (typeof document !== "undefined") {
   document.addEventListener("visibilitychange", resumeOnShow);
}

/* Motion's default driver, for screens that keep the frame loop. */
const frameDriver: Driver = (update) => {
   const pass = ({ timestamp }: { timestamp: number }) => update(timestamp);
   return {
      start: (keepAlive = true) => frame.update(pass, keepAlive),
      stop: () => cancelFrame(pass),
      now: () => (frameData.isProcessing ? frameData.timestamp : time.now()),
   };
};

const clockDriver: Driver = (update) => {
   let stop = () => {};
   return {
      start: (keepAlive = true) => {
         stop();
         stop = onSceneTick(update, keepAlive);
      },
      stop: () => stop(),
      now: () => tickTime ?? performance.now(),
   };
};

/* `transition.driver` for every infinite scene loop. */
export const sceneDriver: Driver = (update) =>
   active ? clockDriver(update) : frameDriver(update);
