import type { Easing, Transition } from "motion/react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import {
   LABEL,
   PANEL,
   WHITE_10,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   WHITE_35,
   bar,
   type PanelProps,
} from "./shared";
import {
   CYCLE,
   T_BLINK,
   T_FADE,
   T_HIDDEN,
   T_LAND,
   T_OK,
   T_OK_END,
   T_REPLY,
   T_SETTLE,
   T_SETTLED,
   T_SHOW,
   T_SNAP,
   T_THREAD,
   T_THREADED,
   T_TYPE,
   T_TYPED,
} from "./socialBeats";

/* Brainstorm Verse: a Threads-style idea feed. POST IDEA types, createIdea
   acks, the new IdeaCard lands at the top of Home while the stack shifts
   down, its thread bar draws and the reply glyph appears. */

const CARD_HEIGHT = 24;
const FEED_GAP = 5;
const PITCH = CARD_HEIGHT + FEED_GAP;
const FEED_CARDS = ["one", "two", "three"];

const EASE: Easing = "easeInOut";

/* Infinite keyframe loop with one ease per segment: Motion runs opacity
   through WAAPI, which would spread a single ease over the whole iteration
   while transforms ease each segment, pulling the two tracks off the beats. */
const loop = (
   duration: number,
   times: number[],
   ease: Easing = EASE,
): Transition => ({
   duration,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

interface IdeaLook {
   avatarFill: string;
   avatarBorder: string;
   firstBar: string;
}

const neutralLook = (tint: string): IdeaLook => ({
   avatarFill: `${tint}20`,
   avatarBorder: `${tint}70`,
   firstBar: WHITE_18,
});

const freshLook = (tint: string): IdeaLook => ({
   avatarFill: `${tint}99`,
   avatarBorder: tint,
   firstBar: `${tint}8c`,
});

/* IdeaCard: avatar with the vertical idea-card_bar, two text lines. */
const IdeaCard = ({ look, thread }: { look: IdeaLook; thread: boolean }) => (
   <div style={{ display: "flex", gap: 5, height: CARD_HEIGHT }}>
      <span
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 8,
            flexShrink: 0,
         }}
      >
         <span
            style={{
               display: "block",
               width: 8,
               height: 8,
               borderRadius: "50%",
               background: look.avatarFill,
               border: `1px solid ${look.avatarBorder}`,
               boxSizing: "border-box",
            }}
         />
         {thread && (
            <span
               style={{
                  display: "block",
                  width: 1,
                  height: 10,
                  marginTop: 2,
                  background: WHITE_14,
               }}
            />
         )}
      </span>
      <span style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
         <span style={bar("70%", look.firstBar)} />
         <span style={{ ...bar("45%", WHITE_10), marginTop: 3 }} />
      </span>
   </div>
);

/* The just-posted idea: tinted while fresh, thread bar draws, reply glyph
   pops, then it settles into the neutral look. */
const FreshCard = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
      transition={loop(CYCLE, [0, T_OK_END, T_LAND, T_HIDDEN, T_SNAP, 1])}
      style={{ position: "relative", height: CARD_HEIGHT }}
   >
      <IdeaCard look={neutralLook(tint)} thread={false} />
      <motion.div
         animate={{ opacity: [1, 1, 0, 0, 1] }}
         transition={loop(CYCLE, [0, T_SETTLE, T_SETTLED, T_SNAP, 1])}
         style={{ position: "absolute", inset: 0 }}
      >
         <IdeaCard look={freshLook(tint)} thread={false} />
      </motion.div>
      <motion.span
         animate={{ scaleY: [0, 0, 1, 1, 0, 0] }}
         transition={loop(CYCLE, [
            0,
            T_THREAD,
            T_THREADED,
            T_HIDDEN,
            T_SNAP,
            1,
         ])}
         style={{
            position: "absolute",
            left: 3.5,
            top: 10,
            width: 1,
            height: 10,
            background: WHITE_14,
            transformOrigin: "top",
         }}
      />
      <motion.span
         animate={{
            opacity: [0, 0, 1, 1, 1, 1, 0, 0],
            scale: [1, 1, 1, 1.2, 1, 1, 1, 1],
         }}
         transition={loop(CYCLE, [
            0,
            T_THREADED,
            T_REPLY,
            0.73,
            T_SETTLE,
            T_HIDDEN,
            T_SNAP,
            1,
         ])}
         style={{
            position: "absolute",
            left: 13,
            top: 15,
            width: 6,
            height: 5,
            borderRadius: 2,
            border: `1px solid ${WHITE_35}`,
            boxSizing: "border-box",
         }}
      >
         <span
            style={{
               position: "absolute",
               left: 1,
               bottom: -2,
               width: 2,
               height: 2,
               borderRight: `1px solid ${WHITE_35}`,
               borderBottom: `1px solid ${WHITE_35}`,
               transform: "rotate(45deg)",
            }}
         />
      </motion.span>
   </motion.div>
);

/* Post Idea textarea: a text bar types in, the pill blinks on submit and a
   green dot acks createIdea + revalidatePath. */
const ComposePill = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ opacity: [1, 1, 0.4, 1, 1] }}
      transition={loop(CYCLE, [0, T_TYPED, T_BLINK, 0.38, 1])}
      style={{
         display: "flex",
         alignItems: "center",
         gap: 4,
         height: 12,
         padding: "0 5px",
         boxSizing: "border-box",
         borderRadius: 6,
         border: `1px solid ${tint}35`,
         background: `${tint}0a`,
         flexShrink: 0,
      }}
   >
      <motion.span
         animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
         transition={loop(CYCLE, [0, T_TYPE, T_TYPED, 0.4, 0.41, 1])}
         style={{ ...bar("100%", WHITE_28), flex: 1, transformOrigin: "left" }}
      />
      <span style={{ ...LABEL, color: `${tint}cc` }}>POST IDEA</span>
      <motion.span
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(CYCLE, [0, 0.34, T_OK, T_OK_END, 0.44, 1])}
         style={{
            display: "block",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: GREEN,
            flexShrink: 0,
         }}
      />
   </motion.div>
);

/* Clipped feed; the card group starts one pitch up so the fresh card is
   hidden, then slides down to reveal it at the top. */
const Feed = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ opacity: [1, 1, 0, 0, 1] }}
      transition={loop(CYCLE, [0, T_FADE, T_HIDDEN, T_SHOW, 1])}
      style={{
         flex: 1,
         minHeight: 0,
         overflow: "hidden",
         position: "relative",
      }}
   >
      <motion.div
         animate={{ y: [-PITCH, -PITCH, 0, 0, -PITCH, -PITCH] }}
         transition={loop(CYCLE, [0, T_OK_END, T_LAND, T_HIDDEN, T_SNAP, 1])}
         style={{ display: "flex", flexDirection: "column", gap: FEED_GAP }}
      >
         <FreshCard tint={tint} />
         {FEED_CARDS.map((id) => (
            <IdeaCard key={id} look={neutralLook(tint)} thread />
         ))}
      </motion.div>
   </motion.div>
);

const SocialPanel = ({ tint }: PanelProps) => (
   <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 5 }}>
      <ComposePill tint={tint} />
      <Feed tint={tint} />
   </div>
);

export default SocialPanel;
