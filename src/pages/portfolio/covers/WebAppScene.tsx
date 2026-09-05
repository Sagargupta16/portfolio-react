import type { ComponentType, CSSProperties } from "react";
import { motion } from "motion/react";
import ContactsPanel from "./webapp/ContactsPanel";
import DefaultPanel from "./webapp/DefaultPanel";
import DirectoryPanel from "./webapp/DirectoryPanel";
import PlacementPanel from "./webapp/PlacementPanel";
import SocialPanel from "./webapp/SocialPanel";
import { CREATE_IDEA_PULSE } from "./webapp/socialBeats";
import TravelPanel from "./webapp/TravelPanel";
import TutoringPanel from "./webapp/TutoringPanel";
import {
   LABEL,
   WHITE_03,
   WHITE_06,
   WHITE_08,
   WHITE_10,
   WHITE_12,
   WHITE_18,
   WHITE_85,
   loop,
   type NavPulse,
   type PanelProps,
} from "./webapp/shared";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Full-stack web app: browser frame with a sidebar rail and a content panel.
   Each variant swaps the panel (covers/webapp/*Panel.tsx) and configures the
   rail: placement | language | directory | contacts | social | travel. */

interface FrameConfig {
   bars: number; // sidebar nav items
   active: number; // highlighted nav index
   whiteActive?: boolean; // solid white active pill instead of tint
   sidebarHidden?: boolean; // top-header apps have no rail
   sidebarEnter?: boolean; // rail slides in at the start of each cycle
   pulse?: NavPulse; // one nav item lit in step with the panel's beats
   headerBar: boolean; // page-title bar above the panel
}

const DEFAULT_FRAME: FrameConfig = { bars: 3, active: 0, headerBar: true };

const FRAME_BY_VARIANT: Record<string, FrameConfig> = {
   placement: { bars: 4, active: 2, headerBar: true },
   language: { bars: 3, active: 0, headerBar: true },
   directory: { bars: 5, active: 3, sidebarEnter: true, headerBar: true },
   contacts: { bars: 5, active: 1, whiteActive: true, headerBar: true },
   social: { bars: 5, active: 0, pulse: CREATE_IDEA_PULSE, headerBar: true },
   travel: { bars: 0, active: -1, sidebarHidden: true, headerBar: false },
};

const PANEL_BY_VARIANT: Record<string, ComponentType<PanelProps>> = {
   placement: PlacementPanel,
   language: TutoringPanel,
   directory: DirectoryPanel,
   contacts: ContactsPanel,
   social: SocialPanel,
   travel: TravelPanel,
};

const CHIP_BY_VARIANT: Record<string, string> = {
   language: "TUTORS",
   directory: "ALUMNI",
   contacts: "CONTACTS",
   social: "IDEAS",
   travel: "JOURNALS",
};

const BAR_INDEXES = [0, 1, 2, 3, 4, 5];
const CHROME_DOTS = [0, 1, 2];
const RAIL_WIDTH = 40;
const RAIL_SLIDE = RAIL_WIDTH + 16;

const RAIL: CSSProperties = {
   width: RAIL_WIDTH,
   flexShrink: 0,
   borderRight: `1px solid ${WHITE_06}`,
   padding: 7,
   display: "flex",
   flexDirection: "column",
   gap: 4,
};

const ROOT: CSSProperties = {
   position: "absolute",
   inset: 0,
   overflow: "hidden",
   background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
};

const WINDOW: CSSProperties = {
   position: "absolute",
   left: "12%",
   right: "12%",
   top: "12%",
   bottom: "14%",
   borderRadius: 8,
   border: `1px solid ${WHITE_12}`,
   background: "rgba(255,255,255,0.02)",
   overflow: "hidden",
};

const CONTENT: CSSProperties = {
   flex: 1,
   minWidth: 0,
   padding: 9,
   display: "flex",
   flexDirection: "column",
   gap: 6,
};

const HEADER_BAR: CSSProperties = {
   display: "block",
   height: 7,
   width: "55%",
   borderRadius: 3,
   background: WHITE_12,
   flexShrink: 0,
};

const CHIP: CSSProperties = {
   ...LABEL,
   position: "absolute",
   right: "13%",
   top: "15%",
   padding: "2px 6px",
   borderRadius: 3,
};

const ChromeBar = () => (
   <div
      style={{
         height: 16,
         display: "flex",
         alignItems: "center",
         gap: 3,
         padding: "0 8px",
         borderBottom: `1px solid ${WHITE_08}`,
         background: WHITE_03,
      }}
   >
      {CHROME_DOTS.map((i) => (
         <span
            key={i}
            style={{
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: WHITE_18,
            }}
         />
      ))}
      <span
         style={{
            marginLeft: 8,
            height: 6,
            width: "40%",
            borderRadius: 3,
            background: WHITE_06,
         }}
      />
   </div>
);

const NAV_BAR: CSSProperties = {
   position: "relative",
   display: "block",
   height: 5,
   borderRadius: 2,
   overflow: "hidden",
};

/* One nav item: the active one is a filled pill; the `pulse` item carries a
   tint overlay that lights up in step with the panel (Social's Create Idea). */
const NavBar = ({
   tint,
   config,
   index,
}: {
   tint: string;
   config: FrameConfig;
   index: number;
}) => {
   const activeBg = config.whiteActive ? WHITE_85 : `${tint}60`;
   const pulse = config.pulse;
   return (
      <span
         style={{
            ...NAV_BAR,
            background: index === config.active ? activeBg : WHITE_10,
         }}
      >
         {pulse?.index === index && (
            <motion.span
               animate={{ opacity: pulse.opacity }}
               transition={pulse.transition}
               style={{
                  position: "absolute",
                  inset: 0,
                  background: `${tint}99`,
               }}
            />
         )}
      </span>
   );
};

/* Nav rail: static bars, one active. `sidebarEnter` slides the rail in at
   the start of each cycle (a sidenav mounting after login). */
const Sidebar = ({ tint, config }: { tint: string; config: FrameConfig }) => {
   const bars = BAR_INDEXES.slice(0, config.bars).map((i) => (
      <NavBar key={i} tint={tint} config={config} index={i} />
   ));

   if (config.sidebarEnter) {
      return (
         <motion.div
            animate={{
               x: [-RAIL_SLIDE, 0, 0, -RAIL_SLIDE],
               opacity: [0, 1, 1, 0],
            }}
            transition={loop(5, [0, 0.12, 0.96, 1])}
            style={RAIL}
         >
            {bars}
         </motion.div>
      );
   }
   return <div style={RAIL}>{bars}</div>;
};

const WebAppScene = ({ tint, variant }: CoverSceneProps) => {
   const key = variant ?? "";
   const Panel = PANEL_BY_VARIANT[key] ?? DefaultPanel;
   const frame = FRAME_BY_VARIANT[key] ?? DEFAULT_FRAME;
   const chip = CHIP_BY_VARIANT[key];

   return (
      <div aria-hidden="true" style={ROOT}>
         <div style={WINDOW}>
            <ChromeBar />
            <div style={{ display: "flex", height: "calc(100% - 16px)" }}>
               {!frame.sidebarHidden && <Sidebar tint={tint} config={frame} />}
               <div style={CONTENT}>
                  {frame.headerBar && <span style={HEADER_BAR} />}
                  <Panel tint={tint} />
               </div>
            </div>
         </div>

         {chip && (
            <span
               style={{
                  ...CHIP,
                  border: `1px solid ${tint}35`,
                  background: `${tint}0a`,
                  color: `${tint}cc`,
               }}
            >
               {chip}
            </span>
         )}
      </div>
   );
};

export default WebAppScene;
