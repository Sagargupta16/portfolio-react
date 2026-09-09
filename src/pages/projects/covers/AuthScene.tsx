import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * One login round trip, mirrored from routes/auth.js: type -> joi passes ->
 * POST /api/auth -> bcrypt.compare on the server -> jwt (7d) travels back ->
 * the client flips to its logged-in bar -> reset. Every loop shares CYCLE so
 * the beats stay in step. Motion is transform/opacity only.
 */
const CYCLE = 5.5;

const GREEN = "#22c55e";
const INK = "#0b1012";
const HAIRLINE = "rgba(255,255,255,0.08)";
const CHROME = "rgba(255,255,255,0.10)";
const FILL = "rgba(255,255,255,0.03)";
const WHITE_70 = "rgba(255,255,255,0.7)";
const SHIELD_RADIUS = "9px 9px 50% 50%";

/* The client card and the server shield anchor the round trip; the hairline
   and both pill tracks run between their borders. */
const CARD_PCT = 9;
const CARD_W = 92;
const SHIELD_PCT = 76;
const TRIP_LEFT = `calc(${CARD_PCT}% + ${CARD_W}px)`;
const TRIP_TOP = "48%";
/* A track spans card border -> shield border minus the width of the pill it
   carries, so `x: 100%` of the track parks that pill with its right edge on
   the shield at any slot width instead of at a fixed px leg. */
const trackWidth = (pillWidth: number) =>
   `calc(${SHIELD_PCT - CARD_PCT}% - ${CARD_W + pillWidth}px)`;
const POST_W = 24;
const JWT_W = 44;

const label = {
   fontFamily: MONO_FONT,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
} as const;

/*
 * Motion hands opacity to WAAPI, where a single ease string stretches over
 * the whole iteration and drags keyframes off their `times`, while x/scale
 * stay per segment on the JS path. One ease per segment keeps every track
 * on the storyboard clock.
 */
const loop = (times: number[]) => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: Array.from({ length: times.length - 1 }, () => "easeInOut" as const),
});

/* Logged-in state of the client (the Main page bar): green strip, heading bar,
   white logout pill. Opaque so it crossfades over the /api/auth header. */
const LoggedInBar = () => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0] }}
      transition={loop([0, 0.76, 0.82, 0.91, 1])}
      style={{
         position: "absolute",
         inset: 0,
         display: "flex",
         alignItems: "center",
         padding: "0 6px",
         background: INK,
      }}
   >
      <div
         style={{ position: "absolute", inset: 0, background: `${GREEN}22` }}
      />
      <div
         style={{
            position: "relative",
            width: 22,
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.5)",
            marginRight: "auto",
         }}
      />
      <motion.div
         animate={{ x: [6, 6, 0, 0, 6], opacity: [0, 0, 1, 1, 0] }}
         transition={loop([0, 0.77, 0.84, 0.91, 1])}
         style={{
            position: "relative",
            width: 12,
            height: 5,
            borderRadius: 999,
            background: WHITE_70,
         }}
      />
   </motion.div>
);

/* Client: the Login card. Password types in, joi passes, Sign In flashes,
   then the fields dim once the token has landed. */
const LoginCard = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: `${CARD_PCT}%`,
         top: "31%",
         width: CARD_W,
         height: 64,
         borderRadius: 6,
         border: `1px solid ${CHROME}`,
         background: FILL,
         overflow: "hidden",
      }}
   >
      <div
         style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: 14,
            padding: "0 6px",
            borderBottom: `1px solid ${HAIRLINE}`,
            background: "rgba(255,255,255,0.04)",
         }}
      >
         <div
            style={{
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: GREEN,
            }}
         />
         <span style={{ ...label, fontSize: 7, color: WHITE_70 }}>
            /api/auth
         </span>
         <LoggedInBar />
      </div>
      <div style={{ padding: "7px 8px 0" }}>
         <motion.div
            animate={{ opacity: [1, 1, 0.3, 0.3, 1] }}
            transition={loop([0, 0.76, 0.82, 0.91, 1])}
         >
            {/* filled email field */}
            <div
               style={{
                  width: "62%",
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.14)",
               }}
            />
            {/* password field typing, complexity check passes */}
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  height: 6,
               }}
            >
               <motion.div
                  animate={{ scaleX: [0, 1, 1, 0] }}
                  transition={loop([0, 0.32, 0.91, 1])}
                  style={{
                     width: "74%",
                     height: 4,
                     borderRadius: 2,
                     background: "rgba(255,255,255,0.3)",
                     transformOrigin: "left center",
                  }}
               />
               <motion.span
                  animate={{ opacity: [0, 0, 0.6, 0.6, 0] }}
                  transition={loop([0, 0.27, 0.33, 0.91, 1])}
                  style={{ ...label, fontSize: 7, lineHeight: 1, color: tint }}
               >
                  joi
               </motion.span>
            </div>
         </motion.div>
         {/* Sign In flashes once typing completes */}
         <motion.div
            animate={{ opacity: [0.35, 0.35, 1, 0.45, 0.35, 0.35] }}
            transition={loop([0, 0.33, 0.36, 0.42, 0.5, 1])}
            style={{
               marginTop: 8,
               width: "100%",
               height: 9,
               borderRadius: 3,
               background: tint,
            }}
         />
      </div>
   </div>
);

/* Credentials out (hollow white pill), token back (tint pill) along the
   hairline. Each pill rides its own track and moves by 100% of it. */
const TransitPills = ({ tint }: { tint: string }) => (
   <>
      <motion.div
         animate={{
            x: ["0%", "0%", "0%", "100%", "100%", "0%"],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={loop([0, 0.34, 0.36, 0.45, 0.48, 1])}
         style={{
            position: "absolute",
            left: TRIP_LEFT,
            top: TRIP_TOP,
            width: trackWidth(POST_W),
            height: 0,
         }}
      >
         <div
            style={{
               position: "absolute",
               top: -5,
               width: POST_W,
               height: 10,
               boxSizing: "border-box",
               borderRadius: 999,
               border: "1px solid rgba(255,255,255,0.5)",
               background: INK,
            }}
         />
      </motion.div>
      <motion.div
         animate={{
            x: ["100%", "100%", "100%", "0%", "0%", "100%"],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={loop([0, 0.64, 0.67, 0.76, 0.8, 1])}
         style={{
            position: "absolute",
            left: TRIP_LEFT,
            top: TRIP_TOP,
            width: trackWidth(JWT_W),
            height: 0,
         }}
      >
         <div
            style={{
               position: "absolute",
               top: -7,
               width: JWT_W,
               height: 15,
               boxSizing: "border-box",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               borderRadius: 999,
               border: `1px solid ${tint}80`,
               background: INK,
               fontSize: 7,
               lineHeight: 1,
               whiteSpace: "nowrap",
            }}
         >
            <span style={{ ...label, color: tint }}>jwt 7d</span>
         </div>
      </motion.div>
   </>
);

/* Server: the shield pulses when the POST lands, bcrypt.compare blinks under
   it, and the green check draws once the password matches. */
const ServerNode = ({ tint }: { tint: string }) => (
   <>
      <div
         style={{
            position: "absolute",
            left: `${SHIELD_PCT}%`,
            top: "37%",
            width: 34,
            height: 38,
         }}
      >
         <div
            style={{
               position: "absolute",
               inset: 0,
               border: "1px solid rgba(255,255,255,0.3)",
               background: FILL,
               borderRadius: SHIELD_RADIUS,
            }}
         />
         <motion.div
            animate={{
               opacity: [0, 0, 0.5, 0, 0],
               scale: [0.9, 0.9, 1.3, 1.45, 0.9],
            }}
            transition={loop([0, 0.44, 0.52, 0.62, 1])}
            style={{
               position: "absolute",
               inset: 0,
               border: `1px solid ${tint}90`,
               borderRadius: SHIELD_RADIUS,
            }}
         />
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1, 1, 0.4] }}
            transition={loop([0, 0.62, 0.7, 0.91, 1])}
            style={{
               position: "absolute",
               left: 11,
               top: 13,
               width: 12,
               height: 6,
               borderLeft: `2px solid ${GREEN}`,
               borderBottom: `2px solid ${GREEN}`,
               rotate: -45,
            }}
         />
      </div>
      <motion.span
         animate={{ opacity: [0.25, 0.25, 0.7, 0.25, 0.7, 0.25, 0.25] }}
         transition={loop([0, 0.42, 0.47, 0.52, 0.57, 0.62, 1])}
         style={{
            ...label,
            position: "absolute",
            left: "74%",
            top: "62%",
            fontSize: 8,
            color: tint,
         }}
      >
         bcrypt
      </motion.span>
   </>
);

/* Padlock: the shackle sits open while typing and settles closed once the
   server has compared the hash; it lifts again on reset. */
const Padlock = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "79%",
         top: "12%",
         width: 22,
         height: 26,
      }}
   >
      <motion.div
         animate={{ y: [-3, -3, 0, 0, -3] }}
         transition={loop([0, 0.45, 0.6, 0.91, 1])}
         style={{
            position: "absolute",
            top: 0,
            left: 4,
            width: 14,
            height: 12,
            border: "2px solid rgba(255,255,255,0.4)",
            borderBottom: "none",
            borderRadius: "7px 7px 0 0",
         }}
      />
      <div
         style={{
            position: "absolute",
            top: 10,
            left: 0,
            width: 22,
            height: 15,
            borderRadius: 4,
            border: `1px solid ${tint}70`,
            background: `${tint}12`,
         }}
      >
         <div
            style={{
               position: "absolute",
               left: 9,
               top: 5,
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: tint,
            }}
         />
      </div>
   </div>
);

const AuthScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
      }}
   >
      {/* faint dot lattice for depth */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
               "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
         }}
      />
      {/* tinted glow behind the round trip */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 42% 46%, ${tint}14, transparent 62%)`,
         }}
      />
      {/* hairline the pills travel along, card border to shield border */}
      <div
         style={{
            position: "absolute",
            left: TRIP_LEFT,
            top: TRIP_TOP,
            width: trackWidth(0),
            height: 1,
            background: HAIRLINE,
         }}
      />

      <LoginCard tint={tint} />
      <TransitPills tint={tint} />
      <ServerNode tint={tint} />
      <Padlock tint={tint} />
   </div>
);

export default AuthScene;
