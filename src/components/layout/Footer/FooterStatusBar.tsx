import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
   getAvailability,
   getLocation,
   getSiteConfig,
   getTimezone,
} from "@data/personal";
import { staggerItem } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";

/* The footer's last row is a status bar: local time where he works, the
   availability line from personal.json, the stack the site is built with and
   the build stamp Vite injects at build time. Everything here is data or
   build metadata; nothing is hardcoded copy. */

const LABEL_COLOR = "rgba(244, 246, 247, 0.55)";
const VALUE_COLOR = "rgba(244, 246, 247, 0.9)";
const CHIP_BG = "rgba(255, 255, 255, 0.06)";
const CHIP_BORDER = "1px solid rgba(255, 255, 255, 0.08)";
const LIVE_GREEN = "#22c55e";

const chipStyle: React.CSSProperties = {
   fontSize: 10,
   color: VALUE_COLOR,
   fontFamily: MONO_FONT,
   padding: "2px 8px",
   borderRadius: 4,
   background: CHIP_BG,
   border: CHIP_BORDER,
   whiteSpace: "nowrap",
};

const labelStyle: React.CSSProperties = {
   fontSize: 10,
   letterSpacing: "0.12em",
   textTransform: "uppercase",
   color: LABEL_COLOR,
   fontFamily: MONO_FONT,
};

interface ClockReading {
   text: string;
   iso: string;
}

const readClock = (timeZone: string): ClockReading => {
   const now = new Date();
   return {
      text: new Intl.DateTimeFormat("en-GB", {
         timeZone,
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
         hour12: false,
      }).format(now),
      iso: now.toISOString(),
   };
};

const zoneAbbreviation = (timeZone: string) =>
   // en-IN yields IST for Asia/Kolkata where en-US would print GMT+5:30.
   new Intl.DateTimeFormat("en-IN", { timeZone, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone;

/** Ticking local clock for the place named in personal.json. */
const LocalClock = ({ timeZone }: { timeZone: string }) => {
   const [now, setNow] = useState(() => readClock(timeZone));

   useEffect(() => {
      const tick = () => setNow(readClock(timeZone));
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
   }, [timeZone]);

   return (
      <time
         dateTime={now.iso}
         style={{
            fontSize: 12,
            fontFamily: MONO_FONT,
            fontVariantNumeric: "tabular-nums",
            color: VALUE_COLOR,
         }}
      >
         {now.text} {zoneAbbreviation(timeZone)}
      </time>
   );
};

const FooterStatusBar = () => {
   const { isMobile } = useBreakpoint();
   const techStack = getSiteConfig().tech_stack || [];
   const availability = getAvailability();
   const timeZone = getTimezone();
   // "Hyderabad, India" -> "Hyderabad"
   const city = getLocation().split(",")[0].trim();

   return (
      <motion.div
         style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
            alignItems: "center",
            gap: isMobile ? 14 : 24,
            width: "100%",
            paddingTop: 20,
            // Clear the fixed motion control and Back to top (44 px tall,
            // 20 or 32 px from the bottom) so neither covers the bar.
            paddingBottom: isMobile ? 72 : 56,
            borderTop: "1px solid rgba(255,255,255,0.08)",
         }}
         variants={staggerItem}
      >
         {/* Left: where and when, plus what he is up to */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 10,
               flexWrap: "wrap",
               justifyContent: isMobile ? "center" : "flex-start",
            }}
         >
            <span
               aria-hidden="true"
               className="animate-glow-pulse"
               style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: LIVE_GREEN,
                  flexShrink: 0,
               }}
            />
            <span style={labelStyle}>{city}</span>
            <LocalClock timeZone={timeZone} />
            {!isMobile && (
               <span
                  style={{
                     ...labelStyle,
                     textTransform: "none",
                     letterSpacing: 0,
                     fontSize: 11,
                  }}
               >
                  {availability}
               </span>
            )}
         </div>

         {/* Centre: the stack */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               flexWrap: "wrap",
               justifyContent: "center",
            }}
         >
            <span style={labelStyle}>Built with</span>
            {techStack.map((tech) => (
               <span key={tech} style={chipStyle}>
                  {tech}
               </span>
            ))}
         </div>

         {/* Right: build stamp */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               justifyContent: isMobile ? "center" : "flex-end",
            }}
         >
            <span style={labelStyle}>Build</span>
            <span style={chipStyle}>v{__APP_VERSION__}</span>
            <span style={chipStyle}>{__BUILD_DATE__}</span>
         </div>
      </motion.div>
   );
};

export default FooterStatusBar;
