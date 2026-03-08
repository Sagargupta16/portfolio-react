import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";
import { ArrowRight } from "lucide-react";
import { fadeIn, scaleIn, sectionRevealEnhanced } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";

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

const GitHub = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const [calendarLoaded, setCalendarLoaded] = useState(false);

   const handleTransformData = useCallback((contributions) => {
      setTimeout(() => setCalendarLoaded(true), 0);
      return contributions;
   }, []);

   // Fallback: hide skeleton after 10s if API never responds
   useEffect(() => {
      const timeout = setTimeout(() => setCalendarLoaded(true), 10000);
      return () => clearTimeout(timeout);
   }, []);

   return (
      <motion.section
         id="github"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
         variants={sectionRevealEnhanced}
      >
         <SectionHeader
            title="GitHub Activity"
            subtitle="My open source contributions"
         />

         <div style={{ maxWidth: 1024, margin: "0 auto", textAlign: "center" }}>
            <motion.div
               className="glass-card"
               style={{
                  padding: isMobile ? "16px 12px" : "24px 40px",
                  overflowX: "auto",
               }}
               variants={scaleIn}
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
                     username="Sagargupta16"
                     colorScheme="dark"
                     transformData={handleTransformData}
                  />
               </div>
            </motion.div>

            <motion.a
               href="https://github.com/Sagargupta16"
               target="_blank"
               rel="noopener noreferrer"
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 32,
                  color: "#06b6d4",
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  fontWeight: 500,
               }}
               variants={fadeIn}
            >
               View Full Profile
               <ArrowRight size={16} />
            </motion.a>
         </div>
      </motion.section>
   );
};

export default GitHub;
