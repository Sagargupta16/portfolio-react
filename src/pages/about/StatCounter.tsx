import { motion } from "motion/react";
import { staggerContainer, rotateInUp } from "@utils/animations";
import AnimatedCounter from "@components/ui/AnimatedCounter";

const STAT_LABELS: Record<string, string> = {
   coding_questions: "Problems Solved",
   leetcode_rating: "LeetCode Rating",
   projects: "Projects",
   contests: "Contests",
   industry_certifications: "Certifications",
   open_source_prs: "Open Source PRs",
};

interface StatCounterProps {
   statEntries: [string, string][];
   isMobile: boolean;
}

const StatCounter = ({ statEntries, isMobile }: StatCounterProps) => (
   <motion.div
      style={{
         display: "grid",
         gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : `repeat(${statEntries.length}, 1fr)`,
         gap: isMobile ? 12 : 16,
         marginTop: isMobile ? 40 : 56,
      }}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "0px 0px -100px 0px" }}
   >
      {statEntries.map(([key, value]) => (
         <motion.div
            key={key}
            variants={rotateInUp}
            className="glass-card"
            style={{
               padding: isMobile ? "18px 12px" : "24px 16px",
               textAlign: "center",
            }}
         >
            <AnimatedCounter value={value} />
            <p
               style={{
                  color: "#6e6e90",
                  fontSize: isMobile ? 10 : 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginTop: 8,
               }}
            >
               {STAT_LABELS[key] ?? key.replaceAll("_", " ")}
            </p>
         </motion.div>
      ))}
   </motion.div>
);

export default StatCounter;
