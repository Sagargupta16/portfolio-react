import MakerMark from "./MakerMark";
import {
   AVATAR_SIZE,
   CARD_FILL,
   DISC_DIAMETER,
   HAIRLINE,
   MAKER_SIZE,
} from "./devAvatarData";

/** Static Maker disc; the surrounding stack ring supplies the motion. */
const AvatarMark = () => {
   return (
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
         }}
      >
         <MakerMark size={MAKER_SIZE} />
      </div>
   );
};

export default AvatarMark;
