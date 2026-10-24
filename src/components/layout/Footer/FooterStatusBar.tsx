import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
   getAvailability,
   getLocation,
   getSiteConfig,
   getTimezone,
} from "@data/personal";
import { getUiCopy } from "@data/ui";
import { staggerItem } from "@utils/animations";
import { fillTemplate } from "@utils/fillTemplate";
import {
   GLASS_BORDER,
   GREEN,
   MEDIA_QUERIES,
   MONO_FONT,
} from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMediaQuery from "@hooks/useMediaQuery";
import { describeGap, offsetMinutes } from "@utils/timeGap";

/* The footer's last row is a status bar: local time where he works, the
   availability line from personal.json, the stack the site is built with and
   the build stamp Vite injects at build time. The labels are the footer copy
   in data/ui.json; the rest is data or build metadata. */

const LABEL_COLOR = "rgb(var(--ch-text) / 0.55)";
const VALUE_COLOR = "rgb(var(--ch-text) / 0.9)";
const CHIP_BG = "rgb(var(--ch-white) / 0.06)";
const CHIP_BORDER = `1px solid ${GLASS_BORDER}`;
// Touch gets a 44 px hit area around the 24 px machine-view chips.
const TOUCH_SLOP_PX = 10;
const COPY = getUiCopy().footer;

// Generated at build from data/*.json (scripts/machine-view.js), in this
// order; each one's description is in the footer copy.
const MACHINE_FILES = ["index.md", "llms.txt", "rss.xml"] as const;

const chipStyle: React.CSSProperties = {
   fontSize: 11,
   color: VALUE_COLOR,
   fontFamily: MONO_FONT,
   padding: "2px 8px",
   borderRadius: 4,
   background: CHIP_BG,
   border: CHIP_BORDER,
   whiteSpace: "nowrap",
};

const labelStyle: React.CSSProperties = {
   fontSize: 11,
   letterSpacing: "0.12em",
   textTransform: "uppercase",
   color: LABEL_COLOR,
   fontFamily: MONO_FONT,
};

interface ClockReading {
   text: string;
   zone: string;
   iso: string;
}

interface ClockFormats {
   time: Intl.DateTimeFormat;
   zone: Intl.DateTimeFormat;
}

// Built once per zone rather than on every tick.
const clockFormats = (timeZone: string): ClockFormats => ({
   time: new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
   }),
   // en-IN yields IST for Asia/Kolkata where en-US would print GMT+5:30.
   zone: new Intl.DateTimeFormat("en-IN", { timeZone, timeZoneName: "short" }),
});

const readClock = (formats: ClockFormats, timeZone: string): ClockReading => {
   const now = new Date();
   return {
      text: formats.time.format(now),
      zone:
         formats.zone
            .formatToParts(now)
            .find((part) => part.type === "timeZoneName")?.value ?? timeZone,
      iso: now.toISOString(),
   };
};

/** Ticking local clock for the place named in personal.json. It ticks only
    while on screen and reads the time afresh each time it scrolls back in. */
const LocalClock = ({ timeZone }: { timeZone: string }) => {
   const timeRef = useRef<HTMLTimeElement>(null);
   const formats = useMemo(() => clockFormats(timeZone), [timeZone]);
   const [now, setNow] = useState(() => readClock(formats, timeZone));
   const [onScreen, setOnScreen] = useState(false);

   useEffect(() => {
      const element = timeRef.current;
      if (!element) return;
      const observer = new IntersectionObserver((entries) => {
         for (const entry of entries) {
            if (entry.isIntersecting) setNow(readClock(formats, timeZone));
            setOnScreen(entry.isIntersecting);
         }
      });
      observer.observe(element);
      return () => observer.disconnect();
   }, [formats, timeZone]);

   useEffect(() => {
      if (!onScreen) return;
      const tick = () => setNow(readClock(formats, timeZone));
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
   }, [onScreen, formats, timeZone]);

   return (
      <time
         ref={timeRef}
         dateTime={now.iso}
         style={{
            fontSize: 12,
            fontFamily: MONO_FONT,
            fontVariantNumeric: "tabular-nums",
            color: VALUE_COLOR,
         }}
      >
         {now.text} {now.zone}
      </time>
   );
};

/** The visitor's own time and how far his clock is from it, so a client in
    London or New York reads the gap without doing the math. Hidden when
    both clocks agree. */
const VisitorGap = ({ timeZone }: { timeZone: string }) => {
   const [visitorZone] = useState(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
   );
   const visitorFormat = useMemo(
      () =>
         new Intl.DateTimeFormat(undefined, {
            timeZone: visitorZone,
            hour: "2-digit",
            minute: "2-digit",
         }),
      [visitorZone],
   );
   const [now, setNow] = useState(() => new Date());

   useEffect(() => {
      const id = window.setInterval(() => setNow(new Date()), 30_000);
      return () => window.clearInterval(id);
   }, []);

   const gap = describeGap(
      offsetMinutes(timeZone, now),
      offsetMinutes(visitorZone, now),
   );
   if (!gap) return null;
   const theirs = visitorFormat.format(now);

   return (
      <span
         style={{
            ...labelStyle,
            textTransform: "none",
            letterSpacing: 0,
            fontSize: 11,
            fontVariantNumeric: "tabular-nums",
         }}
      >
         {fillTemplate(COPY.visitor_gap, { time: theirs, gap })}
      </span>
   );
};

const FooterStatusBar = () => {
   const { isMobile } = useBreakpoint();
   const coarsePointer = useMediaQuery(MEDIA_QUERIES.coarse);
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
            borderTop: `1px solid ${GLASS_BORDER}`,
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
                  background: GREEN,
                  flexShrink: 0,
               }}
            />
            <span style={labelStyle}>{city}</span>
            <LocalClock timeZone={timeZone} />
            <VisitorGap timeZone={timeZone} />
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
            <span style={labelStyle}>{COPY.built_with}</span>
            {techStack.map((tech) => (
               <span key={tech} style={chipStyle}>
                  {tech}
               </span>
            ))}
         </div>

         {/* Right: build stamp, plus the machine-readable copies of the page */}
         <div
            className="footer-build"
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               flexWrap: "wrap",
               justifyContent: isMobile ? "center" : "flex-end",
            }}
         >
            <span style={labelStyle}>{COPY.build}</span>
            <span style={chipStyle}>v{import.meta.env.APP_VERSION}</span>
            <span style={chipStyle}>{import.meta.env.BUILD_DATE}</span>
            {MACHINE_FILES.map((file) => (
               <a
                  key={file}
                  href={`${import.meta.env.BASE_URL}${file}`}
                  className="footer-machine-link"
                  // The link is the hit area and the chip draws inside it. On
                  // touch it grows to 44 px and negative margins hand the
                  // extra back, so the row keeps its 24 px height.
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     borderRadius: chipStyle.borderRadius,
                     textDecoration: "none",
                     minHeight: coarsePointer
                        ? 24 + TOUCH_SLOP_PX * 2
                        : undefined,
                     margin: coarsePointer
                        ? `-${TOUCH_SLOP_PX}px 0`
                        : undefined,
                  }}
                  aria-label={fillTemplate(COPY.machine_link_label, {
                     file,
                     label: COPY.machine_links[file],
                  })}
               >
                  <span
                     style={{
                        ...chipStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 24,
                     }}
                  >
                     {file}
                  </span>
               </a>
            ))}
         </div>
      </motion.div>
   );
};

export default FooterStatusBar;
