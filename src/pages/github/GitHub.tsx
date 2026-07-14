import { useCallback, useEffect, useReducer, useRef } from "react";
import { GitHubCalendar } from "react-github-calendar";
import type { Activity } from "react-github-calendar";
import { getGitHubUsername } from "@data/dataLoader";
import useBreakpoint from "@hooks/useBreakpoint";
import { TEXT_MUTED, CYAN, MAX_WIDTH_WIDE } from "@/constants/theme";
import CodingProfiles from "./CodingProfiles";
import PageSection from "@components/layout/PageSection";
import BrowserMockup from "@components/ui/BrowserMockup";

// -- Constants --
const DAYS_IN_WEEK = 7;
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;
const CALENDAR_TIMEOUT_MS = 10_000;

// -- Skeleton --
const SKELETON_ROWS = Array.from(
   { length: DAYS_IN_WEEK },
   (_, i) => `row-${i}`,
);
const SKELETON_COLS = Array.from(
   { length: WEEKS_IN_YEAR },
   (_, i) => `col-${i}`,
);
const SKELETON_MONTHS = Array.from(
   { length: MONTHS_IN_YEAR },
   (_, i) => `month-${i}`,
);

const CalendarSkeleton = () => (
   <div
      style={{
         display: "flex",
         flexDirection: "column",
         gap: 12,
         alignItems: "center",
      }}
      aria-busy="true"
      aria-label="Loading GitHub contribution calendar"
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
                     borderRadius: 4,
                     opacity:
                        0.3 +
                        ((row * WEEKS_IN_YEAR + col) % DAYS_IN_WEEK) * 0.06,
                     animationDelay: `${(row * WEEKS_IN_YEAR + col) * 2}ms`,
                  }}
               />
            ))}
         </div>
      ))}
      <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
         {SKELETON_MONTHS.map((key) => (
            <div
               key={key}
               className="skeleton"
               style={{ width: 24, height: 10, borderRadius: 4, opacity: 0.3 }}
            />
         ))}
      </div>
   </div>
);

// -- Timeout fallback --
const CalendarTimeout = ({ username }: { username: string }) => (
   <div
      role="status"
      style={{
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         gap: 12,
         padding: "32px 16px",
         textAlign: "center",
      }}
   >
      <p style={{ fontSize: 14, color: TEXT_MUTED, maxWidth: 360 }}>
         GitHub is taking a while to respond. You can view the contributions
         directly on GitHub.
      </p>
      <a
         href={`https://github.com/${username}`}
         target="_blank"
         rel="noopener noreferrer"
         className="btn-outline"
         style={{ fontSize: 14, color: CYAN }}
      >
         Open GitHub profile
      </a>
   </div>
);

/** Stamp --col CSS variable on calendar rects for wave animation */
const stampColumnIndices = (container: HTMLElement) => {
   const rects = container.querySelectorAll<SVGRectElement>(
      ".react-activity-calendar rect[rx]",
   );
   rects.forEach((rect, i) => {
      rect.style.setProperty("--col", String(Math.floor(i / DAYS_IN_WEEK)));
   });
};

// -- Calendar state machine --
type CalendarState = "loading" | "loaded" | "timed-out";
type CalendarAction = { type: "loaded" } | { type: "timeout" };

const calendarReducer = (
   state: CalendarState,
   action: CalendarAction,
): CalendarState => {
   // Once loaded, stay loaded -- ignore later timeout events.
   if (state === "loaded") return state;
   if (action.type === "loaded") return "loaded";
   if (action.type === "timeout") return "timed-out";
   return state;
};

// -- Main component --
const GitHub = () => {
   const { isMobile } = useBreakpoint();
   const githubUsername = getGitHubUsername();
   const [calendarState, dispatch] = useReducer(calendarReducer, "loading");
   const calendarRef = useRef<HTMLDivElement>(null);
   const isLoaded = calendarState === "loaded";
   const isTimedOut = calendarState === "timed-out";
   const isRevealed = calendarState !== "loading";

   const handleTransformData = useCallback(
      (contributions: Activity[]): Activity[] => {
         // defer to next tick so the calendar commits before the reveal animation
         setTimeout(() => dispatch({ type: "loaded" }), 0);
         return contributions;
      },
      [],
   );

   useEffect(() => {
      if (!isLoaded || !calendarRef.current) return;
      const raf = requestAnimationFrame(() => {
         if (calendarRef.current) stampColumnIndices(calendarRef.current);
      });
      return () => cancelAnimationFrame(raf);
   }, [isLoaded]);

   useEffect(() => {
      const timeout = setTimeout(
         () => dispatch({ type: "timeout" }),
         CALENDAR_TIMEOUT_MS,
      );
      return () => clearTimeout(timeout);
   }, []);

   return (
      <PageSection
         id="github"
         title="GitHub Activity"
         subtitle="My open source contributions"
      >
         <div style={{ maxWidth: MAX_WIDTH_WIDE, margin: "0 auto" }}>
            {/* 3D Browser Mockup */}
            <div style={{ textAlign: "center" }}>
               <BrowserMockup
                  path={[githubUsername, "contributions"]}
                  tiltDeg={isMobile ? 30 : 48}
               >
                  <div
                     ref={calendarRef}
                     className={isLoaded ? "calendar-reveal" : ""}
                     style={{ overflowX: "auto" }}
                  >
                     {!isRevealed && <CalendarSkeleton />}
                     {isTimedOut && (
                        <CalendarTimeout username={githubUsername} />
                     )}
                     <div
                        style={
                           isLoaded
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
