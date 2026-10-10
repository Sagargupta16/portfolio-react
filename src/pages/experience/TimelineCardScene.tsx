import type { CSSProperties, ReactNode } from "react";
import type { EngagementSceneKey } from "@/types";
import EngagementScene from "./scenes/EngagementScene";

interface TimelineCardSceneProps {
   /** The card's company, title and summary block. */
   header: ReactNode;
   scene: EngagementSceneKey;
   tint: string;
   isMobile: boolean;
}

const FRAME: CSSProperties = {
   borderRadius: 12,
   border: "1px solid rgba(255,255,255,0.08)",
};

// Desktop: a 16:10 thumbnail beside the summary; it wraps below the text on
// narrow tablets instead of squeezing it.
const ROW: CSSProperties = {
   display: "flex",
   flexWrap: "wrap",
   alignItems: "flex-start",
   gap: 20,
};
const TEXT: CSSProperties = { flex: "1 1 280px", minWidth: 0 };
const THUMB: CSSProperties = {
   ...FRAME,
   flex: "0 0 264px",
   aspectRatio: "16 / 10",
};

// Phones: full width under the summary, capped so the card stays short.
const STRIP: CSSProperties = {
   ...FRAME,
   width: "100%",
   marginTop: 12,
   aspectRatio: "16 / 9",
   maxHeight: 140,
};

/** The role's lead engagement scene on its collapsed timeline card. */
const TimelineCardScene = ({
   header,
   scene,
   tint,
   isMobile,
}: Readonly<TimelineCardSceneProps>) => {
   if (isMobile) {
      return (
         <>
            {header}
            <EngagementScene scene={scene} tint={tint} style={STRIP} />
         </>
      );
   }
   return (
      <div style={ROW}>
         <div style={TEXT}>{header}</div>
         <EngagementScene scene={scene} tint={tint} style={THUMB} />
      </div>
   );
};

export default TimelineCardScene;
