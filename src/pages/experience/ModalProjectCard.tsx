import { motion } from "motion/react";
import { FolderGit2 } from "lucide-react";
import TechTag from "@components/ui/TechTag";
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, CYAN, MONO_FONT } from "@/constants/theme";
import type { ExperienceProject } from "@/types";

interface ModalProjectCardProps {
   project: ExperienceProject;
   index: number;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ModalProjectCard = ({ project, index }: ModalProjectCardProps) => (
   <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
         delay: 0.2 + index * 0.12,
         duration: 0.4,
         ease: EXPO_EASE,
      }}
      style={{
         marginBottom: 20,
         padding: "16px 18px",
         borderRadius: 14,
         background: "rgba(255,255,255,0.02)",
         border: "1px solid rgba(255,255,255,0.05)",
      }}
   >
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
         }}
      >
         <FolderGit2 size={14} style={{ color: CYAN, flexShrink: 0 }} />
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
                  fontSize: 10,
                  color: TEXT_MUTED,
                  fontFamily: MONO_FONT,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
               }}
            >
               {project.date}
            </span>
         )}
      </div>
      <ul
         style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 10,
         }}
      >
         {Object.entries(project.description)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, text]) => (
               <li
                  key={text}
                  style={{
                     color: TEXT_SECONDARY,
                     fontSize: 13,
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
                        background: `${CYAN}80`,
                        marginTop: 8,
                        flexShrink: 0,
                     }}
                  />
                  {text}
               </li>
            ))}
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
         {project.skills.map((s) => (
            <TechTag key={s} label={s} accent={CYAN} size={10} />
         ))}
      </div>
   </motion.div>
);

export default ModalProjectCard;
