import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";
import {
   CONSENT_AT,
   CYCLE,
   GREEN,
   SHARED_A,
   SHARED_B,
   SHEET,
   SHIFT_A,
   SHIFT_B,
   TREE_A,
   TREE_B,
   UNLINK_FROM,
   VIEW_H,
   VIEW_W,
   WHITE_14,
   WHITE_22,
   WHITE_55,
   loop,
} from "./graph/kinfolkLayout";
import { Rails, Tree } from "./graph/FamilyTree";
import { FusePulse, PersonLink, Proposal } from "./graph/PersonLink";

interface CoverSceneProps {
   tint: string;
}

/*
 * Kinfolk: two family trees that each hold a record of the same human.
 * Tree A (tint) has that person as a child under a union; tree B (white)
 * has them as a partner with children of their own. The proposal rides the
 * pending person_link from A to B, consent draws it back solid, and the
 * read-time fusion slides both trees together until the two records stack
 * into one fused card (the app's offset sheet behind it) inside a single
 * three-generation graph. Then the unlink slides them apart again, both
 * copies exactly as they were, which is also the seamless loop.
 */

/* proposal_status of the link, centred over it: pending, accepted, and
   pending again once the unlink restores both views. */
const STATUS: CSSProperties = {
   position: "absolute",
   left: "50%",
   top: "7%",
   transform: "translateX(-50%)",
   fontFamily: MONO_FONT,
   fontSize: 8.5,
   fontWeight: 600,
   lineHeight: 1,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

const GraphScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: `radial-gradient(circle at 50% 38%, ${tint}1f 0%, transparent 60%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
      }}
   >
      <svg
         viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
         preserveAspectRatio="none"
         style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
         }}
      >
         <Rails />
         <PersonLink tint={tint} />
         <Tree
            family={TREE_A}
            shared={SHARED_A}
            card={`${tint}59`}
            sharedCard={tint}
            edge={`${tint}4d`}
            wash={`${tint}1f`}
            shiftX={SHIFT_A}
            shiftY={-SHEET}
         />
         <Tree
            family={TREE_B}
            shared={SHARED_B}
            card={WHITE_22}
            sharedCard={WHITE_55}
            edge={WHITE_14}
            wash="rgba(255,255,255,0.06)"
            shiftX={SHIFT_B}
            shiftY={0}
         />
         <FusePulse />
      </svg>
      <Proposal tint={tint} />
      <motion.div
         animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
         transition={loop(
            0,
            CONSENT_AT - 0.05,
            CONSENT_AT + 0.2,
            5,
            5.4,
            CYCLE,
         )}
         style={{ ...STATUS, color: WHITE_55 }}
      >
         PENDING
      </motion.div>
      <motion.div
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(
            0,
            CONSENT_AT + 0.1,
            CONSENT_AT + 0.4,
            UNLINK_FROM,
            UNLINK_FROM + 0.3,
            CYCLE,
         )}
         style={{ ...STATUS, color: GREEN }}
      >
         ACCEPTED
      </motion.div>
   </div>
);

export default GraphScene;
