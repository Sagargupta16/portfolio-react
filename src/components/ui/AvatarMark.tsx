import { useRef } from "react";
import { motion } from "motion/react";
import usePointerLook from "@hooks/usePointerLook";
import MakerMark from "./MakerMark";
import {
   AVATAR_SIZE,
   CARD_FILL,
   DISC_DIAMETER,
   HAIRLINE,
   MAKER_SIZE,
} from "./devAvatarData";

/** Maker disc; the mark inside leans toward the pointer, the disc stays put. */
const AvatarMark = () => {
   const discRef = useRef<HTMLDivElement>(null);
   const look = usePointerLook(discRef);

   return (
      <div
         ref={discRef}
         style={{
            position: "absolute",
            inset: (AVATAR_SIZE - DISC_DIAMETER) / 2,
            borderRadius: "50%",
            background: CARD_FILL,
            border: `1px solid ${HAIRLINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <motion.div style={{ x: look.x, y: look.y, rotate: look.rotate }}>
            <MakerMark size={MAKER_SIZE} />
         </motion.div>
      </div>
   );
};

export default AvatarMark;
