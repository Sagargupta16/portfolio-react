/* The cast engine: the footer scenes' sprite people. A typed port of the
   footer lab's shared/cast.js; its API is the lab's CAST.md.

   One actor is six elements:
     .cast-actor     translate(x, -y) from the floor centre, z-index;
                     will-change only while it moves across
       .cast-shadow    flat ellipse on the surface the actor stands on
       .cast-lift      the jump parabola (translateY)
         .cast-squash    squash, stretch and sway; origin = ground point
           .cast-sprite    one frame wide (overflow-x: clip): breath, flip, dim
             .cast-strip     the member's whole strip as a background;
                             a transform picks the frame and its ground row

   Why a strip and not stacked images: one request and one decode per member,
   and a pose is a translate of the strip. So a pose swap is a transform like
   every other part of a move: it runs on the compositor, in the same timeline
   as the motion (a stepped track), and a busy main thread cannot pull a frame
   change away from the movement it belongs to.

   The engine reads no motion preference and no scroll position. A scene
   passes Reduced in with stage.reduced(flag) and its on-screen state with
   stage.pause() and stage.resume(); a hidden tab holds the stage by itself. */

import "./cast.css";

export {
   Actor,
   type ActorMode,
   type ActorOptions,
   type ActorSet,
   type HopOptions,
   type JumpOptions,
} from "./actor";
export {
   type CastManifest,
   type CastMember,
   type CastMemberId,
   type FrameRows,
   MEMBER_IDS,
   type MemberFrames,
   memberFrames,
   type Pose,
   POSES,
} from "./art";
export { STOPPED } from "./motion";
export {
   type ArriveOptions,
   type RippleOptions,
   type Show,
   Stage,
   type StageOptions,
} from "./stage";
export { loadTroupe, Troupe } from "./troupe";
