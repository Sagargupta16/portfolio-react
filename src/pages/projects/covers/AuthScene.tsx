import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { Backdrop, Packet, Wires, type Hop } from "./webapp/StageParts";
import {
   BORDER_BOX,
   INK,
   LABEL,
   ROOT,
   WHITE_10,
   WHITE_14,
   WHITE_22,
   WHITE_28,
   WHITE_40,
   WHITE_60,
   bar,
   centredAt,
   disc,
   hCurve,
   loop,
   span,
   vCurve,
   type Pt,
} from "./webapp/shared";

interface CoverSceneProps {
   tint: string;
}

/* One login round trip, as routes/auth.js runs it. The Login card types a
   password and Signs In; POST /api/auth climbs to the server rail, Joi
   validates (green), bcrypt.compare holds on the hash, generateAuthToken
   signs a jwt with expiresIn 7d, the token rides back to the client
   (localStorage "token") and the card swaps to the token-gated Main page
   with its Logout button. */

const CYCLE = 5.6;

const CARD = { left: 8, right: 36, y: 54 };
const RAIL_X = 70;
const JOI_AT: Pt = { x: RAIL_X, y: 20 };
const BCRYPT_AT: Pt = { x: RAIL_X, y: 46 };
const JWT_AT: Pt = { x: RAIL_X, y: 72 };
const CARD_PORT: Pt = { x: CARD.right, y: CARD.y };

const PAD = 7;
const FIELD_H = 11;
const SIGN_IN_CENTRE =
   1 + PAD + 4 + 5 + FIELD_H + 5 + FIELD_H + 6 + FIELD_H / 2;

const REQUEST: Hop = {
   from: CARD_PORT,
   to: JOI_AT,
   depart: 0.22,
   arrive: 0.36,
};
const TOKEN: Hop = { from: JWT_AT, to: CARD_PORT, depart: 0.66, arrive: 0.8 };

const ON_OFF = [0, 0, 1, 1, 0, 0];

const FIELD: CSSProperties = {
   display: "flex",
   alignItems: "center",
   height: FIELD_H,
   padding: "0 4px",
   borderRadius: 3,
   border: `1px solid ${WHITE_14}`,
   boxSizing: BORDER_BOX,
};

/* Main: the token-gated route, a navbar with the white Logout button. */
const MainPage = () => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: ON_OFF }}
      transition={loop(CYCLE, [0, 0.8, 0.86, 0.93, 0.98, 1])}
      style={{
         position: "absolute",
         inset: 0,
         borderRadius: 8,
         background: INK,
         overflow: "hidden",
      }}
   >
      <span
         style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 16,
            padding: "0 7px",
            background: WHITE_10,
         }}
      >
         <span style={bar("46%", WHITE_40, 3)} />
         <span style={{ ...bar(16, WHITE_60, 7), borderRadius: 4 }} />
      </span>
   </motion.div>
);

/* Login: heading, Email, Password typing, Sign In pressing, and the
   "New Here?" Sign Up button under it. */
const LoginCard = ({ tint }: { tint: string }) => (
   <div style={span(CARD.left, CARD.right, CARD.y, SIGN_IN_CENTRE)}>
      <div style={{ padding: PAD }}>
         <span style={bar("72%", WHITE_22)} />
         <span style={{ ...FIELD, marginTop: 5 }}>
            <span style={bar("56%", WHITE_28, 3)} />
         </span>
         <span style={{ ...FIELD, marginTop: 5 }}>
            <motion.span
               initial={{ scaleX: 0 }}
               animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
               transition={loop(CYCLE, [0, 0.04, 0.18, 0.93, 0.98, 1])}
               style={{
                  ...bar("64%", WHITE_40, 3),
                  transformOrigin: "left",
               }}
            />
         </span>
         <motion.span
            initial={{ opacity: 0.75, scale: 1 }}
            animate={{
               opacity: [0.75, 0.75, 1, 0.75, 0.75],
               scale: [1, 1, 0.94, 1, 1],
            }}
            transition={loop(CYCLE, [0, 0.19, 0.21, 0.25, 1])}
            style={{
               display: "block",
               height: FIELD_H,
               marginTop: 6,
               borderRadius: 4,
               background: tint,
            }}
         />
         <span
            style={{
               display: "block",
               height: 1,
               margin: "7px 0 6px",
               background: WHITE_10,
            }}
         />
         <span
            style={{
               display: "block",
               width: "56%",
               height: FIELD_H,
               margin: "0 auto",
               borderRadius: 6,
               border: `1px solid ${WHITE_28}`,
               boxSizing: BORDER_BOX,
            }}
         />
      </div>
      <MainPage />
   </div>
);

const NODE = 10;

const STAGE_LABEL: CSSProperties = {
   ...LABEL,
   left: NODE + 5,
   top: "50%",
   translate: "0 -50%",
};

/* A rail stop: hollow node, its label, and the overlay that marks it. */
const Stop = ({
   at,
   label,
   children,
}: {
   at: Pt;
   label: string;
   children: ReactNode;
}) => (
   <div style={{ ...centredAt(at), width: NODE, height: NODE }}>
      <span
         style={{
            ...disc(NODE, INK),
            position: "absolute",
            inset: 0,
            boxSizing: BORDER_BOX,
            border: `1px solid ${WHITE_28}`,
         }}
      />
      {children}
      <span style={STAGE_LABEL}>{label}</span>
   </div>
);

const MARK: CSSProperties = {
   position: "absolute",
   inset: 0,
   borderRadius: "50%",
};

/* The request walks the rail: Joi, then bcrypt.compare (it holds on the
   hash), then jwt.sign. */
const RailPacket = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: `${RAIL_X}%`,
         top: `${JOI_AT.y}%`,
         height: `${JWT_AT.y - JOI_AT.y}%`,
         width: 0,
      }}
   >
      <motion.div
         initial={{ y: "0%", opacity: 0 }}
         animate={{
            y: ["0%", "0%", "50%", "50%", "100%", "100%", "0%"],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={{
            y: loop(CYCLE, [0, 0.38, 0.46, 0.56, 0.62, 0.7, 1]),
            opacity: loop(CYCLE, [0, 0.36, 0.38, 0.62, 0.65, 1]),
         }}
         style={{ position: "absolute", inset: 0, width: 0, height: "100%" }}
      >
         <span
            style={{
               ...disc(5, tint),
               position: "absolute",
               left: -2.5,
               top: -2.5,
            }}
         />
      </motion.div>
   </div>
);

const ServerRail = ({ tint }: { tint: string }) => (
   <>
      <Stop at={JOI_AT} label="JOI">
         <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: ON_OFF }}
            transition={loop(CYCLE, [0, 0.36, 0.4, 0.88, 0.94, 1])}
            style={{ ...MARK, inset: 2, background: GREEN }}
         />
      </Stop>
      <Stop at={BCRYPT_AT} label="BCRYPT">
         <motion.span
            initial={{ opacity: 0, scale: 1 }}
            animate={{
               opacity: [0, 0, 1, 1, 0, 0],
               scale: [1, 1, 1.25, 1.6, 1.8, 1],
            }}
            transition={loop(CYCLE, [0, 0.46, 0.49, 0.54, 0.6, 1])}
            style={{ ...MARK, border: `1px solid ${GREEN}` }}
         />
      </Stop>
      <Stop at={JWT_AT} label="JWT 7D">
         <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: ON_OFF }}
            transition={loop(CYCLE, [0, 0.62, 0.66, 0.88, 0.94, 1])}
            style={{ ...MARK, background: tint }}
         />
      </Stop>
   </>
);

const TOKEN_HEAD: CSSProperties = {
   left: -6.5,
   top: -2.5,
   width: 13,
   height: 5,
   borderRadius: 3,
};

const AuthScene = ({ tint }: CoverSceneProps) => (
   <div aria-hidden="true" style={ROOT}>
      <Backdrop tint={tint} focus={{ x: 66, y: 46 }} texture="dots" />
      <Wires
         paths={[
            hCurve(REQUEST.from, REQUEST.to),
            hCurve(TOKEN.from, TOKEN.to),
            vCurve(JOI_AT, JWT_AT),
         ]}
      />
      <span
         style={{
            ...LABEL,
            right: `${100 - RAIL_X + 6}%`,
            top: "11%",
            color: `${tint}cc`,
         }}
      >
         /API/AUTH
      </span>
      <LoginCard tint={tint} />
      <ServerRail tint={tint} />
      <Packet hop={REQUEST} color={WHITE_60} cycle={CYCLE} />
      <RailPacket tint={tint} />
      <Packet hop={TOKEN} color={tint} cycle={CYCLE} head={TOKEN_HEAD} />
   </div>
);

export default AuthScene;
