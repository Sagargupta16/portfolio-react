import { GREEN } from "@/constants/theme";
import { getSectionCopy } from "@data/sections";

/**
 * Green pulsing dot with a trailing "Present" label that marks a
 * currently-active role on the experience timeline. Suitable for use inside a
 * flex row (the parent controls the gap).
 */
const PresentIndicator = () => (
   <>
      <span
         className="animate-glow-pulse"
         aria-hidden="true"
         style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: GREEN,
            boxShadow: `0 0 6px ${GREEN}99`,
            flexShrink: 0,
         }}
      />
      <span>{getSectionCopy("experience").card.present}</span>
   </>
);

export default PresentIndicator;
