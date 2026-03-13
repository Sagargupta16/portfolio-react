import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { GitHubCalendar } from "react-github-calendar";
import type { Activity } from "react-github-calendar";
import { ArrowRight } from "lucide-react";
import { getGitHubUsername } from "@data/dataLoader";
import {
   fadeIn,
   PANEL_INITIAL,
   PANEL_VISIBLE,
   PANEL_TRANSITION,
} from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import useRevealInView from "@utils/useRevealInView";
import { MONO_FONT, TEXT_MUTED, GLASS_PANEL_STYLE } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import BrowserMockup from "@components/ui/BrowserMockup";
import TerminalCard from "@components/ui/TerminalCard";
import ActivityFeed from "@components/ui/ActivityFeed";
import NodeDiagram from "@components/ui/NodeDiagram";

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

// -- Terminal config --
const TERMINAL_LINES = [
   {
      text: "gh pr list --author Sagargupta16 --state open",
      type: "command" as const,
   },
   { text: "", type: "output" as const, delay: 200 },
   {
      text: "apache/airflow #63109  template_fields for SalesforceBulk",
      type: "output" as const,
   },
   {
      text: "feast-dev/feast #6081  Agent skills for development",
      type: "output" as const,
   },
   {
      text: "hashicorp/terraform #46867  IoT topic rule fix",
      type: "output" as const,
   },
   { text: "", type: "output" as const, delay: 100 },
   { text: "3 open pull requests", type: "accent" as const },
];

// -- Activity feed --
const FEED_ITEMS = [
   {
      message: "Add template_fields to SalesforceBulkOperator",
      hash: "f16fb5e",
      repo: "apache/airflow",
      time: "today",
      url: "https://github.com/apache/airflow/pull/63109",
   },
   {
      message: "Fix IoT topic rule metric_timestamp validator",
      hash: "a8c2d31",
      repo: "hashicorp/terraform-provider-aws",
      time: "2d ago",
      url: "https://github.com/hashicorp/terraform-provider-aws/pull/46867",
   },
   {
      message: "Add SKILL.md agent skills for feast dev",
      hash: "c4e91b7",
      repo: "feast-dev/feast",
      time: "3d ago",
      url: "https://github.com/feast-dev/feast/pull/6081",
   },
   {
      message: "Migrate langchain to langchain-aws",
      hash: "b72f5a3",
      repo: "aws-samples/iot-twinmaker",
      time: "5d ago",
      url: "https://github.com/aws-samples/aws-iot-twinmaker-samples/pull/166",
   },
   {
      message: "Fix contributor license template",
      hash: "e3d8f12",
      repo: "awslabs/mcp",
      time: "1w ago",
      url: "https://github.com/awslabs/mcp/pull/2607",
   },
];

// -- Workflow diagram --
const WORKFLOW_NODES = [
   { label: "Code", icon: "\u{1F4BB}", x: 50, y: 55 },
   { label: "PR", icon: "\u{1F4E4}", x: 160, y: 30 },
   { label: "Review", icon: "\u{1F50D}", x: 270, y: 55 },
   { label: "CI/CD", icon: "\u{2699}\u{FE0F}", x: 160, y: 130 },
   { label: "Merge", icon: "\u{2705}", x: 270, y: 150 },
];
const WORKFLOW_EDGES = [
   { from: 0, to: 1 },
   { from: 1, to: 2 },
   { from: 1, to: 3 },
   { from: 2, to: 4 },
   { from: 3, to: 4 },
];

/** Stamp --col CSS variable on calendar rects for wave animation */
const stampColumnIndices = (container: HTMLElement) => {
   const rects = container.querySelectorAll<SVGRectElement>(
      ".react-activity-calendar rect[rx]",
   );
   rects.forEach((rect, i) => {
      rect.style.setProperty("--col", String(Math.floor(i / 7)));
   });
};

// -- Stats card --
const StatsCard = () => {
   const { ref, isInView } = useRevealInView();

   const stats = [
      { label: "Open PRs", value: "10", color: "var(--color-accent-green)" },
      { label: "Merged", value: "3", color: "var(--color-accent-purple)" },
      { label: "Repos", value: "50+", color: "var(--color-accent-cyan)" },
      { label: "Orgs", value: "5+", color: "var(--color-accent-amber)" },
   ];

   return (
      <motion.div
         ref={ref}
         initial={PANEL_INITIAL}
         animate={isInView ? PANEL_VISIBLE : {}}
         transition={PANEL_TRANSITION}
         style={{
            ...GLASS_PANEL_STYLE,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 24,
         }}
      >
         <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
         >
            {stats.map((stat, i) => (
               <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                     delay: 0.3 + i * 0.1,
                     duration: 0.5,
                     type: "spring",
                     stiffness: 120,
                     damping: 14,
                  }}
                  style={{ textAlign: "center" }}
               >
                  <div
                     style={{
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: MONO_FONT,
                        color: stat.color,
                        lineHeight: 1,
                        marginBottom: 6,
                     }}
                  >
                     {stat.value}
                  </div>
                  <div
                     style={{
                        fontSize: 11,
                        fontFamily: MONO_FONT,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                     }}
                  >
                     {stat.label}
                  </div>
               </motion.div>
            ))}
         </div>
         <div
            style={{
               marginTop: 20,
               padding: "10px 14px",
               borderRadius: 8,
               background: "rgb(var(--ch-cyan) / 0.05)",
               border: "1px solid rgb(var(--ch-cyan) / 0.1)",
               fontFamily: MONO_FONT,
               fontSize: 11,
               color: TEXT_MUTED,
               textAlign: "center",
               lineHeight: 1.5,
            }}
         >
            Contributing to Apache, HashiCorp, AWS, Feast, Chroma, and more.
         </div>
      </motion.div>
   );
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

            {/* 2x2 Feature grid */}
            <div
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16,
                  marginTop: 48,
               }}
            >
               <TerminalCard
                  title="Terminal"
                  prompt={githubUsername}
                  lines={TERMINAL_LINES}
                  typingSpeed={30}
               />
               <ActivityFeed items={FEED_ITEMS} title="Recent Contributions" />
               <NodeDiagram
                  nodes={WORKFLOW_NODES}
                  edges={WORKFLOW_EDGES}
                  title="Contribution workflow"
                  subtitle="Open source PRs across Apache, HashiCorp, AWS, and more."
               />
               <StatsCard />
            </div>

            {/* Profile link */}
            <div style={{ textAlign: "center" }}>
               <motion.a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 8,
                     marginTop: 32,
                     color: "#06b6d4",
                     fontSize: 14,
                     fontFamily: MONO_FONT,
                     fontWeight: 500,
                  }}
                  variants={fadeIn}
               >
                  View Full Profile
                  <ArrowRight size={16} />
               </motion.a>
            </div>
         </div>
      </PageSection>
   );
};

export default GitHub;
