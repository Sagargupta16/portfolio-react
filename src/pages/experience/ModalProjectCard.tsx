import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { FolderGit2 } from "lucide-react";
import TechTag from "@components/ui/TechTag";
import CaseStudyBrief from "@components/ui/CaseStudyBrief";
import Disclosure from "@components/ui/Disclosure";
import {
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   TEXT_MUTED,
   BLUE_LIGHT,
   MONO_FONT,
   DURATION,
   EASING,
} from "@/constants/theme";
import type { ExperienceProject } from "@/types";
import { getSectionCopy } from "@data/sections";
import ProjectSourceLink from "./ProjectSourceLink";
import EngagementScene from "./scenes/EngagementScene";

interface ModalProjectCardProps {
   project: ExperienceProject;
   index: number;
}

// The card's 16 px padding, bled through so the banner spans its full width.
const CARD_PAD = 16;

// 16:9 on phones; the height cap turns it into 2:1 at the 720 px modal width.
// The explicit width keeps that cap from shrinking the banner sideways.
const BANNER: CSSProperties = {
   width: `calc(100% + ${CARD_PAD * 2}px)`,
   margin: `-${CARD_PAD}px -${CARD_PAD}px 14px`,
   aspectRatio: "16 / 9",
   maxHeight: 336,
   borderRadius: "11px 11px 0 0",
   borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
};

const ModalProjectCard = ({ project, index }: ModalProjectCardProps) => (
   <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
         delay: 0.2 + index * 0.12,
         duration: DURATION.default,
         ease: EASING.cinematic,
      }}
      style={{
         marginBottom: 20,
         padding: CARD_PAD,
         borderRadius: 12,
         background: "rgb(var(--ch-white) / 0.02)",
         border: "1px solid rgb(var(--ch-white) / 0.05)",
      }}
   >
      {project.scene && (
         <EngagementScene
            scene={project.scene}
            tint={BLUE_LIGHT}
            style={BANNER}
            fade
         />
      )}
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
         }}
      >
         <FolderGit2 size={14} style={{ color: BLUE_LIGHT, flexShrink: 0 }} />
         <span
            style={{
               fontSize: 14,
               fontWeight: 600,
               color: TEXT_PRIMARY,
               flex: 1,
            }}
         >
            {project.name}
         </span>
         {project.date && (
            <span
               style={{
                  fontSize: 11,
                  color: TEXT_MUTED,
                  fontFamily: MONO_FONT,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgb(var(--ch-white) / 0.04)",
               }}
            >
               {project.date}
            </span>
         )}
      </div>
      {/* With a brief, the four answers lead and the full bullet list folds
          away; without one, the bullets show as before. */}
      {project.case_study ? (
         <>
            <div style={{ marginBottom: 10 }}>
               <CaseStudyBrief brief={project.case_study} accent={BLUE_LIGHT} />
            </div>
            <div style={{ marginBottom: 8 }}>
               <Disclosure
                  label={getSectionCopy("experience").modal.full_details}
                  accentColor={BLUE_LIGHT}
               >
                  <ul
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginBottom: 8,
                     }}
                  >
                     {/* Integer keys ("1", "2", ... "10") enumerate in
                         numeric order on their own; a string sort put "10"
                         before "2". */}
                     {Object.values(project.description).map((text) => (
                        <li
                           key={text}
                           style={{
                              color: TEXT_SECONDARY,
                              fontSize: 12,
                              lineHeight: 1.7,
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                           }}
                        >
                           <span
                              style={{
                                 width: 5,
                                 height: 5,
                                 borderRadius: "50%",
                                 background: `${BLUE_LIGHT}80`,
                                 marginTop: 8,
                                 flexShrink: 0,
                              }}
                           />
                           {text}
                        </li>
                     ))}
                  </ul>
               </Disclosure>
            </div>
         </>
      ) : (
         <ul
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 4,
               marginBottom: 8,
            }}
         >
            {Object.values(project.description).map((text) => (
               <li
                  key={text}
                  style={{
                     color: TEXT_SECONDARY,
                     fontSize: 12,
                     lineHeight: 1.7,
                     display: "flex",
                     alignItems: "flex-start",
                     gap: 8,
                  }}
               >
                  <span
                     style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: `${BLUE_LIGHT}80`,
                        marginTop: 8,
                        flexShrink: 0,
                     }}
                  />
                  {text}
               </li>
            ))}
         </ul>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
         {project.skills.map((s) => (
            <TechTag key={s} label={s} accent={BLUE_LIGHT} />
         ))}
      </div>
      {project.link && (
         <ProjectSourceLink
            href={project.link}
            label={project.linkLabel}
            projectName={project.name}
            accentColor={BLUE_LIGHT}
         />
      )}
   </motion.div>
);

export default ModalProjectCard;
