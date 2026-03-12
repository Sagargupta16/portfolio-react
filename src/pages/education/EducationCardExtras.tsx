import { Trophy } from "lucide-react";
import type { Education } from "@/types";

interface EducationCardExtrasProps {
   item: Education;
   marginLeft: number;
}

const EducationCardExtras = ({
   item,
   marginLeft,
}: EducationCardExtrasProps) => (
   <>
      {/* Achievements */}
      {(item.achievements?.length ?? 0) > 0 && (
         <div style={{ marginLeft, marginTop: 16 }}>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
               }}
            >
               <Trophy style={{ width: 13, height: 13, color: "#f59e0b" }} />
               <span
                  style={{
                     fontSize: 11,
                     fontWeight: 600,
                     color: "#a5a5c0",
                     textTransform: "uppercase",
                     letterSpacing: "0.05em",
                  }}
               >
                  Achievements
               </span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
               {item.achievements!.map((achievement) => (
                  <li
                     key={achievement}
                     style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                     }}
                  >
                     <span
                        style={{
                           width: 6,
                           height: 6,
                           borderRadius: "50%",
                           backgroundColor: "rgba(245,158,11,0.5)",
                           marginTop: 7,
                           flexShrink: 0,
                        }}
                     />
                     <span
                        style={{
                           color: "#a5a5c0",
                           fontSize: 13,
                           lineHeight: 1.6,
                        }}
                     >
                        {achievement}
                     </span>
                  </li>
               ))}
            </ul>
         </div>
      )}

      {/* Skills */}
      {(item.skills?.length ?? 0) > 0 && (
         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               gap: 6,
               marginTop: 14,
               marginLeft,
            }}
         >
            {item.skills.map((skill) => (
               <span
                  key={skill}
                  style={{
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     fontSize: 11,
                     padding: "3px 10px",
                     borderRadius: 6,
                     background: "rgba(168,85,247,0.08)",
                     color: "#a855f7",
                     border: "1px solid rgba(168,85,247,0.15)",
                  }}
               >
                  {skill}
               </span>
            ))}
         </div>
      )}
   </>
);

export default EducationCardExtras;
