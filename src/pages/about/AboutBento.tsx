import { motion } from "motion/react";
import { bentoCellContainer, bentoCellItem } from "@utils/animations";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import DevAvatar from "@components/ui/DevAvatar";
import CharacterReveal from "@components/ui/CharacterReveal";
import HighlightCard from "./HighlightCard";
import StatCounter from "./StatCounter";
import StatusBadge from "./StatusBadge";

interface AboutBentoProps {
   greeting: string;
   statusText: string;
   highlights: string[];
   statEntries: [string, string][];
   isMobile: boolean;
}

const AboutBento = ({
   greeting,
   statusText,
   highlights,
   statEntries,
   isMobile,
}: AboutBentoProps) => {
   if (isMobile) {
      return (
         <motion.div
            variants={bentoCellContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "0px 0px -80px 0px" }}
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 16,
            }}
         >
            {/* Avatar */}
            <motion.div
               variants={bentoCellItem}
               style={{
                  display: "flex",
                  justifyContent: "center",
                  transform: "scale(0.8)",
               }}
            >
               <DevAvatar />
            </motion.div>

            {/* Status */}
            <StatusBadge statusText={statusText} />

            {/* Greeting */}
            <motion.div variants={bentoCellItem}>
               <CharacterReveal
                  text={greeting}
                  as="h3"
                  style={{
                     fontSize: 22,
                     fontWeight: 700,
                     color: TEXT_PRIMARY,
                     lineHeight: 1.3,
                  }}
               />
            </motion.div>

            {/* Highlights */}
            {highlights.map((text, i) => (
               <HighlightCard
                  key={text}
                  text={text}
                  index={i}
                  isMobile={isMobile}
               />
            ))}

            {/* Stats */}
            <StatCounter statEntries={statEntries} isMobile={isMobile} />
         </motion.div>
      );
   }

   return (
      <motion.div
         variants={bentoCellContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -80px 0px" }}
         style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
         }}
      >
         {/* Avatar - spans 2 rows */}
         <motion.div
            variants={bentoCellItem}
            className="glass-card"
            style={{
               gridRow: "1 / 3",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               padding: 24,
               minHeight: 300,
            }}
         >
            <DevAvatar />
         </motion.div>

         {/* Status Badge */}
         <StatusBadge statusText={statusText} />

         {/* Greeting */}
         <motion.div
            variants={bentoCellItem}
            className="glass-card"
            style={{ padding: "20px 22px" }}
         >
            <CharacterReveal
               text={greeting}
               as="h3"
               style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  lineHeight: 1.3,
               }}
            />
            <p
               style={{
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  color: "#6e6e90",
                  marginTop: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
               }}
            >
               Cloud Consultant | DevOps | MLOps
            </p>
         </motion.div>

         {/* Highlight cards - 2 per row */}
         {highlights.map((text, i) => (
            <HighlightCard
               key={text}
               text={text}
               index={i}
               isMobile={false}
            />
         ))}

         {/* Stats - full width */}
         <div style={{ gridColumn: "1 / -1" }}>
            <StatCounter statEntries={statEntries} isMobile={false} />
         </div>
      </motion.div>
   );
};

export default AboutBento;
