import { loop, type NavPulse } from "./shared";

/* Brainstorm Verse beat boundaries as fractions of the cycle. Kept apart from
   SocialPanel so the frame's nav rail can light Create Idea in step with it. */

export const CYCLE = 5;
export const T_TYPE = 0.16;
export const T_TYPED = 0.32;
export const T_BLINK = 0.35;
export const T_OK = 0.36;
export const T_OK_END = 0.42;
export const T_LAND = 0.54;
export const T_THREAD = 0.58;
export const T_THREADED = 0.66;
export const T_REPLY = 0.7;
export const T_SETTLE = 0.76;
export const T_SETTLED = 0.84;
export const T_FADE = 0.92;
export const T_HIDDEN = 0.96;
export const T_SNAP = 0.97;
export const T_SHOW = 0.98;

/* The frame's second nav item (Create Idea) lights while the compose bar
   types and drops back to rest once createIdea acks. */
export const CREATE_IDEA_PULSE: NavPulse = {
   index: 1,
   opacity: [0, 0, 1, 1, 0, 0],
   transition: loop(CYCLE, [0, T_TYPE, T_TYPED, T_OK, T_OK_END, 1]),
};
