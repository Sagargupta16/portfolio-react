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
   WHITE_28,
   bar,
   centredAt,
   disc,
   hCurve,
   loop,
   span,
   type PanelProps,
   type Pt,
} from "./shared";

/* MCA NITW portal, logged in: the SideNavBar's Alumni link is pressed, the
   alumni loader calls /users/all, the server holds the reply for its one
   second setTimeout (spinner), and the IndividualUser cards come back into
   the grid under the Search pill, row by row. Frame 0 is the loaded page. */

const CYCLE = 5.6;

/* Side nav: logo, Your Profile, CR Cell, Placement Cell, Alumni, Study
   Material, Log Out. Rows are px, so the Alumni row centre is a px offset
   that span() pins to the wire's y. */
const NAV_PAD = 7;
const LOGO = 10;
const LINK_H = 8;
const LINK_GAP = 4;
const LINK_WIDTHS = ["72%", "50%", "84%", "46%", "78%"];
const ALUMNI_LINK = 3;
const ALUMNI_CENTRE =
   1 + NAV_PAD + LOGO + 6 + ALUMNI_LINK * (LINK_H + LINK_GAP) + LINK_H / 2;

const GRID_PAD = 6;
const SEARCH_H = 10;
const CARD_H = 46;
const CARD_GAP = 5;
const FIRST_ROW_CENTRE = 1 + GRID_PAD + SEARCH_H + 6 + CARD_H / 2;

const NAV = { left: 8, right: 25, y: 52 };
const GRID = { left: 54, right: 92, y: 45 };
const SERVER_AT: Pt = { x: 43, y: 24 };

const REQUEST: Hop = {
   from: { x: NAV.right, y: NAV.y },
   to: SERVER_AT,
   depart: 0.12,
   arrive: 0.28,
};
const RESPONSE: Hop = {
   from: SERVER_AT,
   to: { x: GRID.left, y: GRID.y },
   depart: 0.54,
   arrive: 0.68,
};

const PRESS_TIMES = [0, 0.02, 0.05, 0.08, 0.12, 1];
const WAIT_TIMES = [0, 0.28, 0.31, 0.51, 0.54, 1];
const ON_OFF = [0, 0, 1, 1, 0, 0];
const CARD_ROWS = ["top", "bottom"];
const CARDS = ["first", "second", "third"];

const SideNav = ({ tint }: PanelProps) => (
   <div style={span(NAV.left, NAV.right, NAV.y, ALUMNI_CENTRE)}>
      <div style={{ padding: NAV_PAD }}>
         <span style={{ ...disc(LOGO, `${tint}55`), marginBottom: 6 }} />
         <div
            style={{ display: "flex", flexDirection: "column", gap: LINK_GAP }}
         >
            {LINK_WIDTHS.map((width, i) => (
               <span
                  key={width}
                  style={{
                     position: "relative",
                     display: "flex",
                     alignItems: "center",
                     height: LINK_H,
                     padding: "0 3px",
                     borderRadius: 3,
                     background: i === ALUMNI_LINK ? `${tint}38` : undefined,
                  }}
               >
                  <span
                     style={bar(width, i === ALUMNI_LINK ? tint : WHITE_14, 3)}
                  />
                  {i === ALUMNI_LINK && (
                     <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                        transition={loop(CYCLE, PRESS_TIMES)}
                        style={{
                           position: "absolute",
                           inset: -1,
                           borderRadius: 3,
                           border: `1px solid ${tint}`,
                        }}
                     />
                  )}
               </span>
            ))}
         </div>
         <span
            style={{
               display: "block",
               width: "60%",
               height: 8,
               marginTop: 6,
               borderRadius: 4,
               border: `1px solid ${WHITE_14}`,
               boxSizing: BORDER_BOX,
            }}
         />
      </div>
   </div>
);

/* Express /users/all: replies after setTimeout(1000), so it spins first. */
const UsersAll = ({ tint }: PanelProps) => (
   <div style={{ ...centredAt(SERVER_AT), width: 18, height: 17 }}>
      <span style={{ ...LABEL, left: "50%", top: -16, translate: "-50% 0" }}>
         USERS/ALL
      </span>
      <motion.span
         initial={{ opacity: 0, rotate: 0 }}
         animate={{ opacity: ON_OFF, rotate: 360 }}
         transition={{
            opacity: loop(CYCLE, WAIT_TIMES),
            rotate: { duration: 0.8, repeat: Infinity, ease: "linear" },
         }}
         style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: `1.5px solid ${tint}`,
            borderTopColor: CLEAR,
            borderRightColor: CLEAR,
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
            padding: "0 3px",
            borderRadius: 4,
            border: `1px solid ${WHITE_18}`,
            background: INK,
            boxSizing: BORDER_BOX,
         }}
      >
         <span style={bar("100%", WHITE_10, 3)} />
         <span style={bar("100%", WHITE_10, 3)} />
      </span>
   </div>
);

/* IndividualUser: photo, name, Institute, Batch, Share / View Profile. */
const AlumniCard = ({ tint }: PanelProps) => (
   <div
      style={{
         flex: 1,
         minWidth: 0,
         height: CARD_H,
         borderRadius: 5,
         border: `1px solid ${WHITE_10}`,
         background: WHITE_06,
         overflow: "hidden",
         boxSizing: BORDER_BOX,
      }}
   >
      <span style={{ display: "block", height: 18, background: `${tint}2e` }} />
      <span style={{ display: "block", padding: "4px 4px 0" }}>
         <span style={bar("80%", WHITE_28, 3)} />
         <span style={{ ...bar("62%", WHITE_14, 2), marginTop: 3 }} />
         <span style={{ ...bar("46%", WHITE_14, 2), marginTop: 2 }} />
         <span style={{ display: "flex", gap: 3, marginTop: 4 }}>
            <span style={bar("40%", WHITE_14, 3)} />
            <span style={bar("40%", `${tint}80`, 3)} />
         </span>
      </span>
   </div>
);

/* One grid row: clears with the refetch, returns after the reply. */
const CardRow = ({ tint, row }: { tint: string; row: number }) => (
   <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: [1, 1, 0, 0, 1, 1], y: [0, 0, 5, 5, 0, 0] }}
      transition={loop(CYCLE, [
         0,
         0.06,
         0.12,
         0.66 + 0.07 * row,
         0.74 + 0.07 * row,
         1,
      ])}
      style={{ display: "flex", gap: CARD_GAP }}
   >
      {CARDS.map((id) => (
         <AlumniCard key={id} tint={tint} />
      ))}
   </motion.div>
);

const AlumniGrid = ({ tint }: PanelProps) => (
   <div style={span(GRID.left, GRID.right, GRID.y, FIRST_ROW_CENTRE)}>
      <span style={LABEL_ABOVE}>ALUMNI</span>
      <div style={{ padding: GRID_PAD }}>
         <span
            style={{
               position: "relative",
               display: "block",
               height: SEARCH_H,
               marginBottom: 6,
               borderRadius: 5,
               border: `1px solid ${WHITE_14}`,
               boxSizing: BORDER_BOX,
            }}
         >
            <span
               style={{
                  ...disc(4, tint),
                  position: "absolute",
                  right: 3,
                  top: 2,
               }}
            />
         </span>
         <div
            style={{ display: "flex", flexDirection: "column", gap: CARD_GAP }}
         >
            {CARD_ROWS.map((id, row) => (
               <CardRow key={id} tint={tint} row={row} />
            ))}
         </div>
      </div>
   </div>
);

const DirectoryPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 70, y: 52 }} texture="dots" drift />
      <Wires
         paths={[
            hCurve(REQUEST.from, REQUEST.to),
            hCurve(RESPONSE.from, RESPONSE.to),
         ]}
      />
      <SideNav tint={tint} />
      <AlumniGrid tint={tint} />
      <UsersAll tint={tint} />
      <Packet hop={REQUEST} color={tint} cycle={CYCLE} />
      <Packet hop={RESPONSE} color={tint} cycle={CYCLE} />
   </>
);

export default DirectoryPanel;
