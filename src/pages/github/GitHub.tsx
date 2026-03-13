import { useState, useCallback, useEffect, useRef } from "react";
import { GitHubCalendar } from "react-github-calendar";
import type { Activity } from "react-github-calendar";
import { getGitHubUsername } from "@data/dataLoader";
import useMediaQuery from "@utils/useMediaQuery";
import CodingProfiles from "./CodingProfiles";
import PageSection from "@components/layout/PageSection";
import BrowserMockup from "@components/ui/BrowserMockup";

// -- Skeleton --
const SKELETON_ROWS = Array.from({ length: 7 }, (_, i) => `row-${i}`);
const SKELETON_COLS = Array.from({ length: 52 }, (_, i) => `col-${i}`);
const SKELETON_MONTHS = Array.from({ length: 12 }, (_, i) => `month-${i}`);

const CalendarSkeleton = () => (
   <div
      style={{
         display: "flex",
         flexDirection: "column",
         gap: 12,
         alignItems: "center",
      }}
   >
      {SKELETON_ROWS.map((rowKey, row) => (
         <div key={rowKey} style={{ display: "flex", gap: 4 }}>
            {SKELETON_COLS.map((colKey, col) => (
               <div
                  key={colKey}
                  className="skeleton"
                  style={{
                     width: 11,
                     height: 11,
                     borderRadius: 3,
                     opacity: 0.3 + ((row * 52 + col) % 7) * 0.06,
                     animationDelay: `${(row * 52 + col) * 2}ms`,
                  }}
               />
            ))}
         </div>
      ))}
      <div style={{ display: "flex", gap: 28, marginTop: 8 }}>
         {SKELETON_MONTHS.map((key) => (
            <div
               key={key}
               className="skeleton"
               style={{ width: 24, height: 10, borderRadius: 3, opacity: 0.3 }}
            />
         ))}
      </div>
   </div>
);

/** Stamp --col CSS variable on calendar rects for wave animation */
const stampColumnIndices = (container: HTMLElement) => {
   const rects = container.querySelectorAll<SVGRectElement>(
      ".react-activity-calendar rect[rx]",
   );
   rects.forEach((rect, i) => {
      rect.style.setProperty("--col", String(Math.floor(i / 7)));
   });
};

// -- Main component --
const GitHub = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const githubUsername = getGitHubUsername();
   const [calendarLoaded, setCalendarLoaded] = useState(false);
   const calendarRef = useRef<HTMLDivElement>(null);

   const handleTransformData = useCallback(
      (contributions: Activity[]): Activity[] => {
         setTimeout(() => setCalendarLoaded(true), 0);
         return contributions;
      },
      [],
   );

   useEffect(() => {
      if (calendarLoaded && calendarRef.current) {
         const raf = requestAnimationFrame(() => {
            if (calendarRef.current) stampColumnIndices(calendarRef.current);
         });
         return () => cancelAnimationFrame(raf);
      }
   }, [calendarLoaded]);

   useEffect(() => {
      const timeout = setTimeout(() => setCalendarLoaded(true), 10000);
      return () => clearTimeout(timeout);
   }, []);

   return (
      <PageSection
         id="github"
         title="GitHub Activity"
         subtitle="My open source contributions"
      >
         <div style={{ maxWidth: 1024, margin: "0 auto" }}>
            {/* 3D Browser Mockup */}
            <div style={{ textAlign: "center" }}>
               <BrowserMockup
                  path={[githubUsername, "contributions"]}
                  tiltDeg={isMobile ? 30 : 48}
               >
                  <div
                     ref={calendarRef}
                     className={calendarLoaded ? "calendar-reveal" : ""}
                     style={{ overflowX: "auto" }}
                  >
                     {!calendarLoaded && <CalendarSkeleton />}
                     <div
                        style={
                           calendarLoaded
                              ? {}
                              : {
                                   position: "absolute",
                                   opacity: 0,
                                   pointerEvents: "none",
                                }
                        }
                     >
                        <GitHubCalendar
                           username={githubUsername}
                           colorScheme="dark"
                           transformData={handleTransformData}
                        />
                     </div>
                  </div>
               </BrowserMockup>
            </div>

            {/* Coding Profiles + GitHub */}
            <CodingProfiles githubUsername={githubUsername} />
         </div>
      </PageSection>
   );
};

export default GitHub;
