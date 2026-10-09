import SagarFace from "./SagarFace";
import {
   AVATAR_SIZE,
   CARD_FILL,
   DISC_DIAMETER,
   HAIRLINE,
} from "./devAvatarData";

/** Portrait disc: the illustrated face (SagarFace) follows the pointer inside a fixed disc. */
const AvatarMark = () => (
   <div
      style={{
         position: "absolute",
         inset: (AVATAR_SIZE - DISC_DIAMETER) / 2,
         borderRadius: "50%",
         background: CARD_FILL,
         border: `1px solid ${HAIRLINE}`,
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         overflow: "hidden",
      }}
   >
      <SagarFace size={DISC_DIAMETER - 2} />
   </div>
);

export default AvatarMark;
