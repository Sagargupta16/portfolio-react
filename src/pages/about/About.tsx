import { useMemo } from "react";
import { motion } from "motion/react";
import { getAbout, getStatistics } from "@data/dataLoader";
import { staggerContainer, fadeInLeft, fadeInRight } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import DevAvatar from "@components/ui/DevAvatar";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import HighlightCard from "./HighlightCard";
import StatCounter from "./StatCounter";

const About = () => {
   const aboutInfo = getAbout();
   const statistics = getStatistics();
   const isMobile = useMediaQuery("(max-width: 768px)");

   const highlights = useMemo(
      () => [
         aboutInfo.current_role,
         aboutInfo.education,
         aboutInfo.specialization,
         aboutInfo.competitive_programming,
      ],
      [aboutInfo],
   );

   const statEntries = useMemo(() => Object.entries(statistics), [statistics]);

   return (
      <PageSection id="about" title="About Me" subtitle="Get to know me">
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <motion.div
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: isMobile ? 32 : 56,
                  alignItems: "center",
               }}
               variants={staggerContainer}
            >
               {/* Left Column - Animated Avatar */}
               <motion.div
                  variants={fadeInLeft}
                  style={{ display: "flex", justifyContent: "center" }}
               >
                  <div
                     style={isMobile ? { transform: "scale(0.8)" } : undefined}
                  >
                     <DevAvatar />
                  </div>
               </motion.div>

               {/* Right Column - Bio + Highlights */}
               <motion.div variants={fadeInRight}>
                  {/* Status line */}
                  <p
                     style={{
                        fontFamily: MONO_FONT,
                        color: "#22c55e",
                        fontSize: isMobile ? 12 : 13,
                        marginBottom: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                     }}
                  >
                     <span
                        className="animate-glow-pulse"
                        style={{
                           width: 8,
                           height: 8,
                           borderRadius: "50%",
                           backgroundColor: "#22c55e",
                           display: "inline-block",
                           flexShrink: 0,
                        }}
                     />
                     <span>currently building cloud infrastructure at AWS</span>
                  </p>

                  {/* Greeting */}
                  <h3
                     style={{
                        fontSize: isMobile ? 22 : 28,
                        fontWeight: 700,
                        color: "#eeeef5",
                        marginBottom: 16,
                        lineHeight: 1.3,
                     }}
                  >
                     {aboutInfo.greeting.replace(/^[^\s]+\s/, "")}
                  </h3>

                  {/* Highlights */}
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                     }}
                  >
                     {highlights.map((text, i) => (
                        <HighlightCard
                           key={text}
                           text={text}
                           index={i}
                           isMobile={isMobile}
                        />
                     ))}
                  </div>
               </motion.div>
            </motion.div>

            {/* Stats Row - Full Width */}
            <StatCounter statEntries={statEntries} isMobile={isMobile} />
         </div>
      </PageSection>
   );
};

export default About;
