import { useMemo } from "react";
import { getAbout, getStatistics } from "@data/dataLoader";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import AboutBento from "./AboutBento";

const About = () => {
   const aboutInfo = getAbout();
   const statistics = getStatistics();
   const isMobile = useMediaQuery("(max-width: 768px)");

   const greeting = aboutInfo.greeting.replace(/^[^\s]+\s/, "");

   const highlights = useMemo(
      () => [
         aboutInfo.current_role,
         aboutInfo.education,
         aboutInfo.specialization,
         aboutInfo.competitive_programming,
      ],
      [aboutInfo],
   );

   const statEntries = useMemo(
      () => Object.entries(statistics),
      [statistics],
   );

   return (
      <PageSection id="about" title="About Me" subtitle="Get to know me">
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <AboutBento
               greeting={greeting}
               statusText="currently building cloud infrastructure at AWS"
               highlights={highlights}
               statEntries={statEntries}
               isMobile={isMobile}
            />
         </div>
      </PageSection>
   );
};

export default About;
