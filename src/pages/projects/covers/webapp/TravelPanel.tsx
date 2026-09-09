import type { CSSProperties } from "react";
import type { Easing, Transition } from "motion/react";
import { motion } from "motion/react";
import {
   CARD,
   LABEL,
   PANEL,
   WHITE_06,
   WHITE_08,
   WHITE_12,
   WHITE_14,
   WHITE_22,
   WHITE_28,
   WHITE_35,
   bar,
   type PanelProps,
} from "./shared";

/* Tour Vibes: the Journals feed. Controls on top, two photo-first PostCards;
   the left one loads out of its skeleton, an upload progress line runs and
   the new journal slides in, a heart fills, then a tag filter refetches. */

const CYCLE = 5;
const IMAGE_HEIGHT = 30;
const HEART_PATH =
   "M12 21s-7-4.6-9.3-8.6C.6 9 2.6 4.5 6.7 4.5c2 0 3.6 1 4.6 2.6 1-1.6 2.6-2.6 4.6-2.6 4.1 0 6.1 4.5 4 7.9C19 16.4 12 21 12 21z";

/* Beat boundaries as fractions of the cycle. */
const T_LOAD = 0.16;
const T_LOADED = 0.28;
const T_UPLOAD = 0.4;
const T_PRESSED = 0.43;
const T_RELEASED = 0.46;
const T_UPLOADED = 0.52;
const T_LANDED = 0.6;
const T_LIKE = 0.58;
const T_LIKE_PEAK = 0.63;
const T_LIKED = 0.68;
const T_COUNT = 0.62;
const T_FILTER = 0.76;
const T_FILTERED = 0.82;
const T_DIP = 0.78;
const T_DIPPED = 0.84;
const T_REFETCHED = 0.9;
const T_RESET = 0.96;

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

interface TagSpec {
   width: number;
   active?: number[];
}

/* Outline tag Badges; the active one moves from the second to the third. */
const TAGS: TagSpec[] = [
   { width: 18 },
   { width: 24, active: [1, 1, 0, 0, 1] },
   { width: 16, active: [0, 0, 1, 1, 0] },
];

const JOURNAL_CARD: CSSProperties = {
   ...CARD,
   borderRadius: 5,
   position: "relative",
   flex: 1,
   minWidth: 0,
   overflow: "hidden",
};

/* Search input, sort select and the New Journal button. */
const ControlRow = ({ tint }: PanelProps) => (
   <div
      style={{
         display: "flex",
         alignItems: "center",
         gap: 4,
         height: 9,
         flexShrink: 0,
      }}
   >
      <span
         style={{
            position: "relative",
            flex: 1,
            maxWidth: "50%",
            minWidth: 0,
            height: 9,
            borderRadius: 5,
            background: WHITE_06,
         }}
      >
         <span
            style={{
               position: "absolute",
               left: 3,
               top: 3,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: WHITE_35,
            }}
         />
      </span>
      <span style={{ ...LABEL, color: `${tint}b3` }}>NEWEST</span>
      <span style={{ flex: 1 }} />
      <motion.span
         animate={{
            scale: [1, 1, 0.9, 1, 1, 1],
            opacity: [0.55, 0.55, 1, 1, 1, 0.55],
         }}
         transition={loop(CYCLE, [0, T_UPLOAD, T_PRESSED, T_RELEASED, 0.92, 1])}
         style={{
            ...LABEL,
            padding: "1px 3px",
            borderRadius: 3,
            border: `1px solid ${tint}35`,
            background: `${tint}0a`,
            color: `${tint}cc`,
            flexShrink: 0,
         }}
      >
         NEW JOURNAL
      </motion.span>
   </div>
);

const TagRow = ({ tint }: PanelProps) => (
   <div style={{ display: "flex", gap: 3, height: 6, flexShrink: 0 }}>
      {TAGS.map((tag) => (
         <span
            key={tag.width}
            style={{
               position: "relative",
               display: "block",
               width: tag.width,
               height: 6,
               borderRadius: 3,
               border: `1px solid ${WHITE_14}`,
               boxSizing: "border-box",
            }}
         >
            {tag.active && (
               <motion.span
                  animate={{ opacity: tag.active }}
                  transition={loop(CYCLE, [
                     0,
                     T_FILTER,
                     T_FILTERED,
                     T_RESET,
                     1,
                  ])}
                  style={{
                     position: "absolute",
                     inset: 0,
                     borderRadius: 3,
                     background: `${tint}40`,
                  }}
               />
            )}
         </span>
      ))}
   </div>
);

/* Multer upload: a progress line runs, then fades. */
const ProgressLine = ({ tint }: PanelProps) => (
   <motion.span
      animate={{ scaleX: [0, 0, 1, 1, 0], opacity: [0, 1, 1, 0, 0] }}
      transition={loop(CYCLE, [0, T_UPLOAD, T_UPLOADED, 0.56, 1])}
      style={{
         display: "block",
         height: 1,
         background: tint,
         transformOrigin: "left",
         flexShrink: 0,
      }}
   />
);

/* PostCard body: 16:9 image, title, MapPin meta line. */
const JournalBody = ({ tint }: PanelProps) => (
   <>
      <span
         style={{
            display: "block",
            height: IMAGE_HEIGHT,
            background: `linear-gradient(180deg, ${tint}4d, ${tint}1a)`,
         }}
      />
      <span style={{ display: "block", padding: 3 }}>
         <span style={bar("70%", WHITE_22)} />
         <span
            style={{
               display: "flex",
               alignItems: "center",
               gap: 2,
               marginTop: 2,
            }}
         >
            <span
               style={{
                  display: "block",
                  width: 4,
                  height: 4,
                  borderRadius: "50% 50% 50% 0",
                  background: tint,
                  transform: "rotate(-45deg)",
                  flexShrink: 0,
               }}
            />
            <span style={bar("45%", WHITE_12, 2)} />
         </span>
      </span>
   </>
);

const Heart = ({ fill }: { fill: string }) => (
   <svg
      viewBox="0 0 24 24"
      width={6}
      height={6}
      style={{ position: "absolute", inset: 0 }}
   >
      <path d={HEART_PATH} fill={fill} />
   </svg>
);

/* LikeButton: heart scales and fills tint, the count block pops in. */
const LikeMark = ({ tint }: PanelProps) => (
   <span
      style={{
         position: "absolute",
         right: 3,
         bottom: 3,
         display: "flex",
         alignItems: "center",
         gap: 2,
      }}
   >
      <motion.span
         animate={{ scale: [1, 1, 1.4, 1, 1, 1] }}
         transition={loop(CYCLE, [0, T_LIKE, T_LIKE_PEAK, T_LIKED, T_RESET, 1])}
         style={{ position: "relative", display: "block", width: 6, height: 6 }}
      >
         <Heart fill={WHITE_28} />
         <motion.span
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={loop(CYCLE, [0, T_LIKE, 0.64, T_RESET, 1])}
            style={{ position: "absolute", inset: 0 }}
         >
            <Heart fill={tint} />
         </motion.span>
      </motion.span>
      <motion.span
         animate={{ scaleX: [0, 0, 1, 1, 0] }}
         transition={loop(CYCLE, [0, T_COUNT, T_LIKED, T_RESET, 1])}
         style={{ ...bar(4, WHITE_28, 2), transformOrigin: "left" }}
      />
   </span>
);

/* Left card: SkeletonCard resolves into the loaded PostCard. */
const LoadedCard = ({ tint }: PanelProps) => (
   <div style={JOURNAL_CARD}>
      <motion.span
         animate={{ opacity: [0.3, 0.3, 1, 1, 0.3] }}
         transition={loop(CYCLE, [0, T_LOAD, T_LOADED, T_RESET, 1])}
         style={{ display: "block" }}
      >
         <JournalBody tint={tint} />
      </motion.span>
      <motion.span
         animate={{ opacity: [0.5, 0.5, 0, 0, 0.5] }}
         transition={loop(CYCLE, [0, T_LOAD, T_LOADED, T_RESET, 1])}
         style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: IMAGE_HEIGHT,
            background: WHITE_08,
         }}
      />
      <LikeMark tint={tint} />
   </div>
);

/* Right card: the freshly posted journal landing at the head of the feed. */
const FreshCard = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ y: [8, 8, 0, 0, 8], opacity: [0, 0, 1, 1, 0] }}
      transition={loop(CYCLE, [0, T_UPLOADED, T_LANDED, T_RESET, 1])}
      style={JOURNAL_CARD}
   >
      <JournalBody tint={tint} />
   </motion.div>
);

const TravelPanel = ({ tint }: PanelProps) => (
   <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 3 }}>
      <ControlRow tint={tint} />
      <TagRow tint={tint} />
      <ProgressLine tint={tint} />
      <motion.div
         animate={{ opacity: [1, 1, 0.55, 1, 1] }}
         transition={loop(CYCLE, [0, T_DIP, T_DIPPED, T_REFETCHED, 1])}
         style={{ display: "flex", gap: 6, alignItems: "flex-start" }}
      >
         <LoadedCard tint={tint} />
         <FreshCard tint={tint} />
      </motion.div>
      <span
         style={{
            ...LABEL,
            color: WHITE_35,
            textAlign: "center",
            marginTop: "auto",
         }}
      >
         1 / 3
      </span>
   </div>
);

export default TravelPanel;
