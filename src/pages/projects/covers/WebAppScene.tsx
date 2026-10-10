import type { ComponentType } from "react";
import ContactsPanel from "./webapp/ContactsPanel";
import DefaultPanel from "./webapp/DefaultPanel";
import DirectoryPanel from "./webapp/DirectoryPanel";
import PlacementPanel from "./webapp/PlacementPanel";
import SocialPanel from "./webapp/SocialPanel";
import TravelPanel from "./webapp/TravelPanel";
import TutoringPanel from "./webapp/TutoringPanel";
import { ROOT, type PanelProps } from "./webapp/shared";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Full-stack web apps as one family. Every variant is a stage that reads
   left to right: the app's own UI fragment where the action starts, the
   server step it calls, and the UI that changes when the reply lands, wired
   with S curves that packets ride. Each stage (covers/webapp/*Panel.tsx)
   brings its own panels, nouns and beats. */

const STAGE_BY_VARIANT: Record<string, ComponentType<PanelProps>> = {
   placement: PlacementPanel,
   language: TutoringPanel,
   directory: DirectoryPanel,
   contacts: ContactsPanel,
   social: SocialPanel,
   travel: TravelPanel,
};

const WebAppScene = ({ tint, variant }: CoverSceneProps) => {
   const Stage = STAGE_BY_VARIANT[variant ?? ""] ?? DefaultPanel;
   return (
      <div aria-hidden="true" style={ROOT}>
         <Stage tint={tint} />
      </div>
   );
};

export default WebAppScene;
