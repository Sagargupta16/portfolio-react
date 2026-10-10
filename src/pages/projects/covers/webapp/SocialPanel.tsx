import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { Backdrop, Packet, Wires, type Hop } from "./StageParts";
import {
   BORDER_BOX,
   INK,
   LABEL,
   LABEL_ABOVE,
   WHITE_10,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   WHITE_40,
   bar,
   centredAt,
   disc,
   hCurve,
   loop,
   span,
   type PanelProps,
   type Pt,
} from "./shared";

/* Brainstorm Verse: the PostIdea form types an idea and submits, the
   createIdea server action checks the Clerk session (green) and saves the
   Idea, revalidatePath sends the new IdeaCard to the top of the Home feed
   while the older cards shift down, and its reply glyph pops. */

const CYCLE = 5;

const COMPOSE = { left: 8, right: 34, y: 56 };
const FEED = { left: 62, right: 92, y: 40 };
const ACTION_AT: Pt = { x: 50, y: 22 };

const PAD = 7;
const TEXTAREA_H = 30;
const BUTTON_H = 11;
const BUTTON_CENTRE = 1 + PAD + 3 + 4 + TEXTAREA_H + 6 + BUTTON_H / 2;

const CARD_H = 21;
const CARD_GAP = 6;
const PITCH = CARD_H + CARD_GAP;
const FEED_PAD = 6;
const VISIBLE = 4;
const TOP_CARD_CENTRE = 1 + FEED_PAD + CARD_H / 2;
const OLDER = ["one", "two", "three", "four"];

const SUBMIT: Hop = {
   from: { x: COMPOSE.right, y: COMPOSE.y },
   to: ACTION_AT,
   depart: 0.22,
   arrive: 0.38,
};
const REVALIDATE: Hop = {
   from: ACTION_AT,
   to: { x: FEED.left, y: FEED.y },
   depart: 0.46,
   arrive: 0.6,
};

const ON_OFF = [0, 0, 1, 1, 0, 0];
const NODE = 18;

/* The idea textarea, typing; the Post Idea button presses on submit. */
const PostIdeaForm = ({ tint }: PanelProps) => (
   <div style={span(COMPOSE.left, COMPOSE.right, COMPOSE.y, BUTTON_CENTRE)}>
      <span style={LABEL_ABOVE}>POST IDEA</span>
      <div style={{ padding: PAD }}>
         <span style={bar("40%", WHITE_14, 3)} />
         <div
            style={{
               height: TEXTAREA_H,
               marginTop: 4,
               padding: 5,
               borderRadius: 4,
               border: `1px solid ${WHITE_10}`,
               boxSizing: BORDER_BOX,
            }}
         >
            <span style={bar("88%", WHITE_28, 3)} />
            <span style={{ ...bar("72%", WHITE_28, 3), marginTop: 4 }} />
            <motion.span
               initial={{ scaleX: 0 }}
               animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
               transition={loop(CYCLE, [0, 0.04, 0.16, 0.4, 0.42, 1])}
               style={{
                  ...bar("56%", WHITE_28, 3),
                  marginTop: 4,
                  transformOrigin: "left",
               }}
            />
         </div>
         <motion.span
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{
               opacity: [0.7, 0.7, 1, 0.7, 0.7],
               scale: [1, 1, 0.94, 1, 1],
            }}
            transition={loop(CYCLE, [0, 0.17, 0.2, 0.24, 1])}
            style={{
               display: "block",
               height: BUTTON_H,
               marginTop: 6,
               borderRadius: 4,
               background: tint,
            }}
         />
      </div>
   </div>
);

/* "use server" createIdea: auth() resolves (green), Idea.create runs. */
const CreateIdeaNode = ({ tint }: PanelProps) => (
   <div style={{ ...centredAt(ACTION_AT), width: NODE, height: NODE }}>
      <span style={{ ...LABEL, left: "50%", top: -14, translate: "-50% 0" }}>
         CREATEIDEA
      </span>
      <span
         style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 5,
            border: `1px solid ${tint}99`,
            background: INK,
         }}
      >
         <span style={disc(5, `${tint}99`)} />
      </span>
      <motion.span
         initial={{ opacity: 0, scale: 0.4 }}
         animate={{ opacity: ON_OFF, scale: [0.4, 0.4, 1, 1, 0.4, 0.4] }}
         transition={loop(CYCLE, [0, 0.38, 0.42, 0.56, 0.6, 1])}
         style={{
            ...disc(6, GREEN),
            position: "absolute",
            right: -3,
            top: -3,
         }}
      />
   </div>
);

interface Look {
   avatar: string;
   text: string;
}

const neutral: Look = { avatar: WHITE_18, text: WHITE_28 };

/* IdeaCard: avatar over the idea-card_bar, the idea text, reply glyph. */
const IdeaCard = ({ look }: { look: Look }) => (
   <div style={{ display: "flex", gap: 6, height: CARD_H }}>
      <span
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 9,
            flexShrink: 0,
         }}
      >
         <span style={disc(9, look.avatar)} />
         <span
            style={{
               flex: 1,
               width: 1,
               marginTop: 3,
               background: WHITE_10,
            }}
         />
      </span>
      <span style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
         <span style={bar("46%", look.text, 3)} />
         <span style={{ ...bar("86%", WHITE_14, 3), marginTop: 4 }} />
         <span style={{ ...bar("60%", WHITE_10, 2), marginTop: 3 }} />
      </span>
   </div>
);

const REPLY: CSSProperties = {
   position: "absolute",
   left: 15,
   bottom: 0,
   width: 7,
   height: 5,
   borderRadius: 1.5,
   border: `1px solid ${WHITE_40}`,
   boxSizing: BORDER_BOX,
};

/* The new idea: tinted while fresh, settles to the neutral look. */
const FreshIdea = ({ tint }: PanelProps) => (
   <div style={{ position: "relative" }}>
      <IdeaCard look={neutral} />
      <motion.div
         initial={{ opacity: 1 }}
         animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
         transition={loop(CYCLE, [0, 0.8, 0.88, 0.955, 0.965, 1])}
         style={{ position: "absolute", inset: 0 }}
      >
         <IdeaCard look={{ avatar: tint, text: `${tint}cc` }} />
      </motion.div>
      <motion.span
         initial={{ opacity: 0, scale: 0.6 }}
         animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0.6, 0.6, 1.2, 1, 0.6, 0.6],
         }}
         transition={loop(CYCLE, [0, 0.7, 0.74, 0.78, 0.96, 1])}
         style={REPLY}
      />
   </div>
);

/* Home: the stack starts one pitch up (the fresh card clipped above),
   slides down as revalidatePath lands, then fades and snaps back. */
const HomeFeed = ({ tint }: PanelProps) => (
   <div
      style={{
         ...span(FEED.left, FEED.right, FEED.y, TOP_CARD_CENTRE),
         height: 2 + 2 * FEED_PAD + VISIBLE * CARD_H + (VISIBLE - 1) * CARD_GAP,
         overflow: "hidden",
      }}
   >
      <motion.div
         initial={{ y: -PITCH, opacity: 1 }}
         animate={{
            y: [-PITCH, -PITCH, 0, 0, -PITCH, -PITCH],
            opacity: [1, 1, 0, 0, 1],
         }}
         transition={{
            y: loop(CYCLE, [0, 0.6, 0.7, 0.955, 0.965, 1]),
            opacity: loop(CYCLE, [0, 0.9, 0.95, 0.97, 1]),
         }}
         style={{
            display: "flex",
            flexDirection: "column",
            gap: CARD_GAP,
            padding: FEED_PAD,
         }}
      >
         <FreshIdea tint={tint} />
         {OLDER.map((id) => (
            <IdeaCard key={id} look={neutral} />
         ))}
      </motion.div>
   </div>
);

const SocialPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 72, y: 44 }} texture="dots" drift />
      <Wires
         paths={[
            hCurve(SUBMIT.from, SUBMIT.to),
            hCurve(REVALIDATE.from, REVALIDATE.to),
         ]}
      />
      <PostIdeaForm tint={tint} />
      <CreateIdeaNode tint={tint} />
      <HomeFeed tint={tint} />
      <span
         style={{
            ...LABEL,
            left: `calc(${FEED.left}% + 1px)`,
            top: `calc(${FEED.y}% - ${TOP_CARD_CENTRE + 13}px)`,
         }}
      >
         HOME
      </span>
      <Packet hop={SUBMIT} color={tint} cycle={CYCLE} />
      <Packet hop={REVALIDATE} color={tint} cycle={CYCLE} />
   </>
);

export default SocialPanel;
