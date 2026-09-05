import { getName } from "@data/personal";
import { CYAN } from "@/constants/theme";
import {
   AVATAR_SIZE,
   CARD_FILL,
   DISC_DIAMETER,
   HAIRLINE,
   MONOGRAM_SIZE,
} from "./devAvatarData";

/** "Sagar Gupta" -> "SG": first letter of the first two words. */
const toInitials = (name: string) =>
   name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

/**
 * Static flat disc with the initials in the hero's display face and accent.
 * Nothing here moves; the ring in DevAvatar carries the only motion.
 */
const AvatarMonogram = () => {
   const initials = toInitials(getName());

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
         <span
            className="display-heading"
            style={{ fontSize: MONOGRAM_SIZE, lineHeight: 1, color: CYAN }}
         >
            {initials}
         </span>
      </div>
   );
};

export default AvatarMonogram;
