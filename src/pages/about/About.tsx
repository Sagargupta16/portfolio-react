import { useMemo } from "react";
import { motion } from "motion/react";
import { getAbout, getStatistics } from "@data/dataLoader";
import { staggerContainer, fadeInLeft, fadeInRight } from "@utils/animations";
import { GREEN, MONO_FONT } from "@/constants/theme";
import DevAvatar from "@components/ui/DevAvatar";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import CharacterReveal from "@components/ui/CharacterReveal";
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
               {/* Left - Avatar */}
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

               {/* Right - Bio */}
               <motion.div variants={fadeInRight}>
                  {/* Status pill */}
                  <div
                     style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: `${GREEN}08`,
                        border: `1px solid ${GREEN}20`,
                        marginBottom: 20,
                     }}
                  >
                     <span
                        className="animate-glow-pulse"
                        style={{
                           width: 7,
                           height: 7,
                           borderRadius: "50%",
                           backgroundColor: GREEN,
                           flexShrink: 0,
                        }}
                     />
                     <span
                        style={{
                           fontFamily: MONO_FONT,
                           color: GREEN,
                           fontSize: isMobile ? 11 : 12,
                           fontWeight: 500,
                        }}
                     >
                        currently building cloud infrastructure at AWS
                     </span>
                  </div>

                  {/* Greeting */}
                  <CharacterReveal
                     text={aboutInfo.greeting.replace(/^[^\s]+\s/, "")}
                     as="h3"
                     style={{
                        fontSize: isMobile ? 22 : 28,
                        fontWeight: 700,
                        color: "#eeeef5",
                        marginBottom: 16,
                        lineHeight: 1.3,
                     }}
                  />

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

            {/* Stats Row */}
            <StatCounter statEntries={statEntries} isMobile={isMobile} />
         </div>
      </PageSection>
   );
};

export default About;
