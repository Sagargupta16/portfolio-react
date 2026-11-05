import type { CSSProperties } from "react";
import type { EngagementSceneKey } from "@/types";
import EngagementScene from "./scenes/EngagementScene";

interface TimelineCardSceneProps {
   scene: EngagementSceneKey;
   tint: string;
   /** Below desktop the scene is a strip across the top of the card. */
   stacked: boolean;
}

// Desktop: the card's right column, edge to edge like the service art, at
// least as tall as a 16:10 frame of the column. Below desktop: a strip on top,
// like a project cover, capped so the card stays short.
const COLUMN: CSSProperties = { flex: 1, width: "100%", minHeight: 212 };
const STRIP: CSSProperties = {
   width: "100%",
   aspectRatio: "16 / 9",
   maxHeight: 180,
};

/** The role's scene on its timeline card. */
const TimelineCardScene = ({
   scene,
   tint,
   stacked,
}: Readonly<TimelineCardSceneProps>) => (
   <EngagementScene
      scene={scene}
      tint={tint}
      style={stacked ? STRIP : COLUMN}
   />
);

export default TimelineCardScene;
