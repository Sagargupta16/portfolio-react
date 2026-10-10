import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { Backdrop, Packet, Wires, type Hop } from "./StageParts";
import {
   BORDER_BOX,
   CENTER_XY,
   CENTER_Y,
   EASE,
   LABEL,
   LABEL_ABOVE,
   WHITE_06,
   WHITE_08,
   WHITE_10,
   WHITE_14,
   WHITE_22,
   WHITE_28,
   WHITE_60,
   avatar,
   bar,
   disc,
   hCurve,
   loop,
   span,
   type PanelProps,
} from "./shared";

/* Orbit, "the people in your orbit": circles on the left (Family, Friends,
   Work, Network) with contacts riding them. One leaves its ring and lands
   as a row of the Contacts DataTable (POST /api/contacts, then reload),
   with its status badge and circle tag; the row is checked and the
   selection badge appears. Frame 0 is the full table. */

const CYCLE = 5.4;

/* The orbit box is 30% wide and square, so on the 16:10 slot it is 48% of
   the height: centre (23, 50), radius 15% of the width = 24% of the height. */
const ORBIT_LEFT = 8;
const ORBIT_W = 30;
const ORBIT_CENTRE = { x: ORBIT_LEFT + ORBIT_W / 2, y: 50 };
const DEPART_ANGLE = (35 * Math.PI) / 180;

const TABLE = { left: 46, right: 92, y: 46 };
const PAD = 6;
const TOOLBAR_H = 10;
const HEAD_H = 6;
const ROW_H = 14;
const ROW_GAP = 3;
const NEW_ROW_CENTRE =
   1 + PAD + TOOLBAR_H + 6 + HEAD_H + 4 + ROW_H + ROW_GAP + ROW_H / 2;

const JOIN: Hop = {
   from: {
      x: ORBIT_CENTRE.x + (ORBIT_W / 2) * Math.cos(DEPART_ANGLE),
      y: ORBIT_CENTRE.y - ORBIT_W * 0.8 * Math.sin(DEPART_ANGLE),
   },
   to: { x: TABLE.left, y: TABLE.y },
   depart: 0.14,
   arrive: 0.36,
};

const FILL_TIMES = [0, 0.05, 0.11, 0.36, 0.44, 1];
const SELECT_TIMES = [0, 0.52, 0.58, 0.86, 0.92, 1];
const ON_OFF = [0, 0, 1, 1, 0, 0];

/* Rings sit at these insets of the orbit box; dots ride them at angles. */
const RINGS = ["0%", "13%", "26%", "39%"];
const RIDERS = [
   { id: "network", ring: 0, angle: 150, strong: true },
   { id: "network2", ring: 0, angle: 265, strong: false },
   { id: "work", ring: 1, angle: 20, strong: false },
   { id: "friends", ring: 2, angle: 200, strong: true },
   { id: "family", ring: 3, angle: 95, strong: true },
];

const riderAt = (ring: number, angle: number): CSSProperties => {
   const radius = 50 - Number.parseFloat(RINGS[ring]);
   const rad = (angle * Math.PI) / 180;
   return {
      position: "absolute",
      left: `${50 + radius * Math.cos(rad)}%`,
      top: `${50 - radius * Math.sin(rad)}%`,
      transform: CENTER_XY,
   };
};

const OrbitRings = ({ tint }: PanelProps) => (
   <div
      style={{
         position: "absolute",
         left: `${ORBIT_LEFT}%`,
         top: `${ORBIT_CENTRE.y}%`,
         width: `${ORBIT_W}%`,
         aspectRatio: "1",
         transform: CENTER_Y,
      }}
   >
      {RINGS.map((inset, i) => (
         <span
            key={inset}
            style={{
               position: "absolute",
               inset,
               borderRadius: "50%",
               border: `1px solid ${i === 0 ? WHITE_10 : WHITE_08}`,
            }}
         />
      ))}
      <motion.div
         initial={{ rotate: 0 }}
         animate={{ rotate: 360 }}
         transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
         style={{ position: "absolute", inset: 0 }}
      >
         {RIDERS.map((r) => (
            <span
               key={r.id}
               style={{
                  ...riderAt(r.ring, r.angle),
                  ...disc(5, r.strong ? `${tint}b3` : WHITE_28),
               }}
            />
         ))}
      </motion.div>
      <motion.span
         initial={{ opacity: 0.6 }}
         animate={{ opacity: [0.6, 1, 0.6] }}
         transition={{ duration: 2.7, repeat: Infinity, ease: [EASE, EASE] }}
         style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: CENTER_XY,
            ...disc(10, tint),
         }}
      />
      <span
         style={{
            ...LABEL,
            left: "50%",
            top: "calc(100% + 6px)",
            translate: "-50% 0",
         }}
      >
         CIRCLES
      </span>
   </div>
);

const ROW: CSSProperties = {
   position: "relative",
   display: "flex",
   alignItems: "center",
   gap: 4,
   height: ROW_H,
   borderBottom: `1px solid ${WHITE_06}`,
};

const CHECKBOX: CSSProperties = {
   position: "relative",
   display: "block",
   width: 7,
   height: 7,
   borderRadius: 2,
   border: `1px solid ${WHITE_22}`,
   boxSizing: BORDER_BOX,
   flexShrink: 0,
};

const STATUS_W = 18;
const CIRCLE_W = 14;

const STATUS_PILL: CSSProperties = {
   position: "relative",
   display: "block",
   width: STATUS_W,
   height: 7,
   borderRadius: 4,
   flexShrink: 0,
};

/* Name + email, StatusBadge (active / paused / pending) and the circle. */
const RowCells = ({
   tint,
   status,
   circle = WHITE_14,
}: {
   tint: string;
   status: string;
   circle?: string;
}) => (
   <>
      <span style={avatar(tint, 10)} />
      <span style={{ flex: 1, minWidth: 0 }}>
         <span style={bar("62%", WHITE_28, 3)} />
         <span style={{ ...bar("44%", WHITE_10, 2), marginTop: 3 }} />
      </span>
      <span style={{ ...STATUS_PILL, background: status }}>
         <span
            style={{
               ...disc(4, WHITE_60),
               position: "absolute",
               left: 2,
               top: 1.5,
            }}
         />
      </span>
      <span style={bar(CIRCLE_W, circle, 3)} />
   </>
);

const LAYER: CSSProperties = {
   position: "absolute",
   inset: 0,
   display: "flex",
   alignItems: "center",
   gap: 4,
};

/* The contact that just landed: cells fade in over a skeleton, then the
   row is checked and tinted. */
const NewRow = ({ tint }: PanelProps) => (
   <div style={ROW}>
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: ON_OFF }}
         transition={loop(CYCLE, SELECT_TIMES)}
         style={{
            position: "absolute",
            inset: "0 -3px",
            borderRadius: 4,
            background: `${tint}14`,
         }}
      />
      <span style={CHECKBOX}>
         <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: ON_OFF }}
            transition={loop(CYCLE, SELECT_TIMES)}
            style={{
               position: "absolute",
               inset: 0,
               borderRadius: 1,
               background: tint,
            }}
         />
      </span>
      <span
         style={{ position: "relative", flex: 1, minWidth: 0, height: ROW_H }}
      >
         <span style={LAYER}>
            <span style={disc(10, WHITE_06)} />
            <span style={bar("30%", WHITE_06, 3)} />
         </span>
         <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
            transition={loop(CYCLE, FILL_TIMES)}
            style={LAYER}
         >
            <RowCells tint={tint} status={`${tint}40`} circle={`${tint}b3`} />
         </motion.span>
      </span>
   </div>
);

/* Search pill and the Add contact button. */
const Toolbar = ({ tint }: PanelProps) => (
   <div
      style={{
         display: "flex",
         alignItems: "center",
         height: TOOLBAR_H,
         marginBottom: 6,
      }}
   >
      <span
         style={{
            flex: 1,
            maxWidth: "52%",
            height: TOOLBAR_H,
            borderRadius: 4,
            border: `1px solid ${WHITE_10}`,
            background: WHITE_06,
            boxSizing: BORDER_BOX,
         }}
      />
      <span
         style={{
            position: "relative",
            width: 24,
            height: TOOLBAR_H,
            marginLeft: "auto",
            borderRadius: 4,
            background: `${tint}e6`,
         }}
      >
         <span
            style={{
               position: "absolute",
               left: 9,
               top: 4.5,
               width: 6,
               height: 1,
               background: WHITE_60,
            }}
         />
         <span
            style={{
               position: "absolute",
               left: 11.5,
               top: 2,
               width: 1,
               height: 6,
               background: WHITE_60,
            }}
         />
      </span>
   </div>
);

/* "N selected" Badge: shown as a tint pill with a check, no count. */
const SelectedBadge = ({ tint }: PanelProps) => (
   <motion.span
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: ON_OFF, y: [2, 2, 0, 0, 0, 2] }}
      transition={loop(CYCLE, [0, 0.56, 0.62, 0.86, 0.92, 1])}
      style={{
         position: "absolute",
         right: 1,
         top: -14,
         width: 20,
         height: 9,
         borderRadius: 5,
         border: `1px solid ${tint}66`,
         background: `${tint}1f`,
         boxSizing: BORDER_BOX,
      }}
   >
      <span
         style={{
            position: "absolute",
            left: 7,
            top: 1,
            width: 3,
            height: 5,
            borderRight: `1px solid ${tint}`,
            borderBottom: `1px solid ${tint}`,
            transform: "rotate(45deg)",
         }}
      />
   </motion.span>
);

const ContactsTable = ({ tint }: PanelProps) => (
   <div style={span(TABLE.left, TABLE.right, TABLE.y, NEW_ROW_CENTRE)}>
      <span style={LABEL_ABOVE}>CONTACTS</span>
      <SelectedBadge tint={tint} />
      <div style={{ padding: PAD }}>
         <Toolbar tint={tint} />
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 4,
               height: HEAD_H,
               marginBottom: 4,
               paddingLeft: 11,
            }}
         >
            <span style={bar("26%", WHITE_10, 3)} />
            <span
               style={{ ...bar(STATUS_W, WHITE_10, 3), marginLeft: "auto" }}
            />
            <span style={bar(CIRCLE_W, WHITE_10, 3)} />
         </div>
         <div
            style={{ display: "flex", flexDirection: "column", gap: ROW_GAP }}
         >
            <div style={ROW}>
               <span style={CHECKBOX} />
               <RowCells tint={tint} status={`${tint}40`} />
            </div>
            <NewRow tint={tint} />
            <div style={ROW}>
               <span style={CHECKBOX} />
               <RowCells tint={tint} status={WHITE_10} />
            </div>
            <div style={ROW}>
               <span style={CHECKBOX} />
               <RowCells tint={tint} status={`${tint}1f`} />
            </div>
         </div>
      </div>
   </div>
);

const ContactsPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 30, y: 48 }} texture="grid" drift />
      <Wires paths={[hCurve(JOIN.from, JOIN.to)]} />
      <OrbitRings tint={tint} />
      <ContactsTable tint={tint} />
      <Packet hop={JOIN} color={tint} cycle={CYCLE} />
   </>
);

export default ContactsPanel;
