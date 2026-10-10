import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { Backdrop, Packet, Wires, type Hop } from "./StageParts";
import {
   BORDER_BOX,
   CLEAR,
   INK,
   LABEL,
   LABEL_ABOVE,
   WHITE_06,
   WHITE_10,
   WHITE_14,
   WHITE_18,
   WHITE_22,
   WHITE_40,
   bar,
   centredAt,
   hCurve,
   loop,
   span,
   type PanelProps,
   type Pt,
} from "./shared";

/* Tour Vibes: the New Journal form takes a photo (preview fills), the
   FormData POST hands the image to Multer's diskStorage, and the created
   post lands as the first PostCard in Journals, photo first, with its
   MapPin location; then its Heart fills as it is liked. */

const CYCLE = 5.2;

const FORM = { left: 8, right: 33, y: 30 };
const GRID = { left: 60, right: 92, y: 42 };
const MULTER_AT: Pt = { x: 47, y: 62 };

const FORM_PAD = 7;
const DROPZONE_H = 30;
const DROPZONE_CENTRE = 1 + FORM_PAD + DROPZONE_H / 2;

const CARD_H = 50;
const PHOTO_H = 28;
const CARD_GAP = 6;
const OTHER_CARDS = ["north", "east", "south"];

const UPLOAD: Hop = {
   from: { x: FORM.right, y: FORM.y },
   to: MULTER_AT,
   depart: 0.16,
   arrive: 0.34,
};
const CREATED: Hop = {
   from: MULTER_AT,
   to: { x: GRID.left, y: GRID.y },
   depart: 0.44,
   arrive: 0.58,
};

const ON_OFF = [0, 0, 1, 1, 0, 0];
const HEART = 8;
const HEART_PATH =
   "M12 21s-7-4.6-9.3-8.6C.6 9 2.6 4.5 6.7 4.5c2 0 3.6 1 4.6 2.6 1-1.6 2.6-2.6 4.6-2.6 4.1 0 6.1 4.5 4 7.9C19 16.4 12 21 12 21z";

const photo = (tint: string, strength: string): string =>
   `linear-gradient(160deg, ${tint}${strength}, ${tint}14)`;

/* MapPin teardrop plus the location name. */
const Location = ({ tint }: PanelProps) => (
   <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span
         style={{
            display: "block",
            width: 5,
            height: 5,
            borderRadius: "50% 50% 50% 0",
            background: tint,
            transform: "rotate(-45deg)",
            flexShrink: 0,
         }}
      />
      <span style={bar("50%", WHITE_14, 3)} />
   </span>
);

const tag = (width: number): CSSProperties => ({
   display: "block",
   width,
   height: 7,
   borderRadius: 4,
   border: `1px solid ${WHITE_14}`,
   boxSizing: BORDER_BOX,
});

/* PostForm: image dropzone, title, content, tags, location. */
const JournalForm = ({ tint }: PanelProps) => (
   <div style={span(FORM.left, FORM.right, FORM.y, DROPZONE_CENTRE)}>
      <span style={LABEL_ABOVE}>NEW JOURNAL</span>
      <div style={{ padding: FORM_PAD }}>
         <span
            style={{
               position: "relative",
               display: "block",
               height: DROPZONE_H,
               borderRadius: 4,
               border: `1px dashed ${WHITE_18}`,
               boxSizing: BORDER_BOX,
               overflow: "hidden",
            }}
         >
            <motion.span
               initial={{ opacity: 0 }}
               animate={{ opacity: ON_OFF }}
               transition={loop(CYCLE, [0, 0.04, 0.12, 0.9, 0.96, 1])}
               style={{
                  position: "absolute",
                  inset: 0,
                  background: photo(tint, "8c"),
               }}
            />
         </span>
         <span style={{ ...bar("72%", WHITE_22), marginTop: 6 }} />
         <span style={{ ...bar("90%", WHITE_10, 3), marginTop: 5 }} />
         <span style={{ ...bar("64%", WHITE_10, 3), marginTop: 3 }} />
         <span style={{ display: "flex", gap: 3, marginTop: 5 }}>
            <span style={tag(14)} />
            <span style={tag(18)} />
         </span>
         <span style={{ display: "block", marginTop: 5 }}>
            <Location tint={tint} />
         </span>
      </div>
   </div>
);

/* Multer diskStorage into images/: the disk pulses as the file lands. */
const MULTER_W = 20;
const MULTER_H = 16;

const MulterNode = ({ tint }: PanelProps) => (
   <div style={{ ...centredAt(MULTER_AT), width: MULTER_W, height: MULTER_H }}>
      <motion.span
         initial={{ opacity: 0, scale: 1 }}
         animate={{
            opacity: [0, 0, 1, 0.5, 0, 0],
            scale: [1, 1, 1.1, 1.45, 1.55, 1],
         }}
         transition={loop(CYCLE, [0, 0.34, 0.37, 0.41, 0.46, 1])}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 5,
            border: `1px solid ${tint}`,
         }}
      />
      <span
         style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
            padding: "0 4px",
            borderRadius: 4,
            border: `1px solid ${WHITE_18}`,
            background: INK,
            boxSizing: BORDER_BOX,
         }}
      >
         <span style={bar("100%", WHITE_14, 2)} />
         <span style={bar("70%", `${tint}99`, 2)} />
      </span>
      <span
         style={{
            ...LABEL,
            left: "50%",
            top: MULTER_H + 6,
            translate: "-50% 0",
         }}
      >
         MULTER
      </span>
   </div>
);

const POST_CARD: CSSProperties = {
   position: "relative",
   height: CARD_H,
   borderRadius: 5,
   border: `1px solid ${WHITE_10}`,
   background: WHITE_06,
   overflow: "hidden",
   boxSizing: BORDER_BOX,
};

/* PostCard: aspect-video photo, title, MapPin line. */
const CardBody = ({ tint, strength }: { tint: string; strength: string }) => (
   <>
      <span
         style={{
            display: "block",
            height: PHOTO_H,
            background: photo(tint, strength),
         }}
      />
      <span style={{ display: "block", padding: "4px 5px 0" }}>
         <span style={bar("70%", WHITE_22, 3)} />
         <span style={{ display: "block", marginTop: 4 }}>
            <Location tint={tint} />
         </span>
      </span>
   </>
);

const HEART_SPOT: CSSProperties = {
   position: "absolute",
   right: 4,
   bottom: 4,
   width: HEART,
   height: HEART,
};

/* Heart: outline at rest, filled tint once liked. */
const Heart = ({ tint }: PanelProps) => (
   <motion.svg
      viewBox="0 0 24 24"
      width={HEART}
      height={HEART}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
         opacity: [0, 0, 1, 1, 0, 0],
         scale: [0.6, 0.6, 1.35, 1, 0.6, 0.6],
      }}
      transition={loop(CYCLE, [0, 0.7, 0.74, 0.78, 0.92, 1])}
      style={HEART_SPOT}
   >
      <path d={HEART_PATH} fill={tint} />
   </motion.svg>
);

/* Journals grid; the created post lands in the empty first slot. */
const JournalsGrid = ({ tint }: PanelProps) => (
   <div
      style={{
         position: "absolute",
         left: `${GRID.left}%`,
         right: `${100 - GRID.right}%`,
         top: `${GRID.y}%`,
         transform: `translateY(-${CARD_H / 2}px)`,
         display: "grid",
         gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
         gap: CARD_GAP,
      }}
   >
      <span style={LABEL_ABOVE}>JOURNALS</span>
      <div
         style={{
            ...POST_CARD,
            border: `1px dashed ${WHITE_14}`,
            background: CLEAR,
            overflow: "visible",
         }}
      >
         <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: ON_OFF, y: [6, 6, 0, 0, 0, 6] }}
            transition={loop(CYCLE, [0, 0.58, 0.66, 0.9, 0.96, 1])}
            style={{
               ...POST_CARD,
               position: "absolute",
               inset: -1,
               height: "auto",
            }}
         >
            <CardBody tint={tint} strength="b3" />
            <svg
               viewBox="0 0 24 24"
               width={HEART}
               height={HEART}
               style={HEART_SPOT}
            >
               <path
                  d={HEART_PATH}
                  fill="none"
                  stroke={WHITE_40}
                  strokeWidth={2}
               />
            </svg>
            <Heart tint={tint} />
         </motion.div>
      </div>
      {OTHER_CARDS.map((id) => (
         <div key={id} style={POST_CARD}>
            <CardBody tint={tint} strength="40" />
         </div>
      ))}
   </div>
);

const imageHead = (tint: string): CSSProperties => ({
   left: -4.5,
   top: -3.5,
   width: 9,
   height: 7,
   borderRadius: 2,
   background: photo(tint, "ff"),
});

const TravelPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 74, y: 46 }} texture="contour" />
      <Wires
         paths={[
            hCurve(UPLOAD.from, UPLOAD.to),
            hCurve(CREATED.from, CREATED.to),
         ]}
      />
      <JournalForm tint={tint} />
      <MulterNode tint={tint} />
      <JournalsGrid tint={tint} />
      <Packet hop={UPLOAD} color={tint} cycle={CYCLE} head={imageHead(tint)} />
      <Packet hop={CREATED} color={tint} cycle={CYCLE} />
   </>
);

export default TravelPanel;
