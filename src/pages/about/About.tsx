import { useMemo } from "react";
import { motion } from "motion/react";
import { getAbout } from "@data/dataLoader";
import { staggerContainer, fadeInLeft, fadeInRight } from "@utils/animations";
import { GREEN, MONO_FONT, TEXT_PRIMARY, MAX_WIDTH } from "@/constants/theme";
import DevAvatar from "@components/ui/DevAvatar";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import CharacterReveal from "@components/ui/CharacterReveal";
import HighlightCard from "./HighlightCard";
import QuickFacts from "./QuickFacts";

const About = () => {
   const aboutInfo = getAbout();
   const { isMobile } = useBreakpoint();

   const highlights = useMemo(
      () => [
         aboutInfo.current_role,
         aboutInfo.education,
         aboutInfo.specialization,
         aboutInfo.competitive_programming,
      ],
      [aboutInfo],
   );

   return (
      <PageSection id="about" title="About Me" subtitle="Get to know me">
         <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
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
                        padding: "4px 12px",
                        borderRadius: 16,
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
                        color: TEXT_PRIMARY,
                        marginBottom: 16,
                        lineHeight: 1.2,
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

            {/* Quick facts band (hero already shows the numeric stats) */}
            <QuickFacts isMobile={isMobile} />
         </div>
      </PageSection>
   );
};

export default About;
