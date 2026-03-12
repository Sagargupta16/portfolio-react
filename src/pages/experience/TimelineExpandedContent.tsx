import { motion } from "motion/react";
import { FolderGit2 } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { BulletList, SkillTags } from "./experienceHelpers";
import { FADE_ENTRY } from "./experienceConstants";

interface TimelineExpandedContentProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor: string;
   fontSize: number;
}

const TimelineExpandedContent = ({
   item,
   accentColor,
   fontSize,
}: TimelineExpandedContentProps) => {
   const hasProjects = "projects" in item && (item.projects?.length ?? 0) > 0;
   const itemProjects = "projects" in item ? item.projects : undefined;
   const itemProject = "project" in item ? item.project : undefined;
   const descriptionItems = Object.values(item.description || {});

   return (
      <motion.div
         initial={{ y: -8 }}
         animate={{ y: 0 }}
         exit={{ y: -8 }}
         transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
         {/* Multi-project: project names + descriptions + skills */}
         {hasProjects &&
            itemProjects!.map((project, idx) => {
               const descs = Object.values(project.description || {});
               return (
                  <motion.div
                     key={project.name}
                     {...FADE_ENTRY}
                     transition={{
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                        delay: idx * 0.08,
                     }}
                     style={{
                        marginTop: idx === 0 ? 16 : 20,
                        paddingTop: idx === 0 ? 0 : 16,
                        borderTop:
                           idx === 0
                              ? "none"
                              : "1px solid rgba(255,255,255,0.04)",
                     }}
                  >
                     <p
                        style={{
                           color: "#6e6e90",
                           fontSize: 13,
                           marginBottom: 10,
                           display: "flex",
                           alignItems: "center",
                           gap: 6,
                        }}
                     >
                        <FolderGit2
                           size={12}
                           style={{ flexShrink: 0, color: "#6e6e90" }}
                        />
                        {project.name}
                     </p>
                     {descs.length > 0 && (
                        <BulletList
                           items={descs}
                           accentColor={accentColor}
                           fontSize={fontSize}
                        />
                     )}
                     {(project.skills?.length ?? 0) > 0 && (
                        <SkillTags
                           skills={project.skills}
                           accentColor={accentColor}
                           extraStyle={{ marginTop: 12 }}
                        />
                     )}
                  </motion.div>
               );
            })}

         {/* Single project name */}
         {!hasProjects && itemProject && (
            <motion.p
               {...FADE_ENTRY}
               transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
               style={{
                  color: "#6e6e90",
                  fontSize: 13,
                  marginTop: 16,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
               }}
            >
               <FolderGit2
                  size={12}
                  style={{ flexShrink: 0, color: "#6e6e90" }}
               />
               {itemProject}
            </motion.p>
         )}
         {/* Single project descriptions */}
         {!hasProjects && descriptionItems.length > 0 && (
            <motion.div
               {...FADE_ENTRY}
               transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.05,
               }}
            >
               <BulletList
                  items={descriptionItems}
                  gap={10}
                  extraStyle={{ marginTop: 16 }}
                  accentColor={accentColor}
                  fontSize={fontSize}
               />
            </motion.div>
         )}
         {/* Single project skills */}
         {!hasProjects && (item.skills?.length ?? 0) > 0 && (
            <motion.div
               {...FADE_ENTRY}
               transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.1,
               }}
            >
               <SkillTags
                  skills={item.skills}
                  accentColor={accentColor}
                  extraStyle={{ marginTop: 16 }}
               />
            </motion.div>
         )}
      </motion.div>
   );
};

export default TimelineExpandedContent;
