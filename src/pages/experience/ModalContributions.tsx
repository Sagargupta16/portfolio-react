import { motion } from "motion/react";
import { GraduationCap } from "lucide-react";
import {
   TEXT_SECONDARY,
   TEXT_MUTED,
   AMBER,
   MONO_FONT,
} from "@/constants/theme";
import type { InternalContribution } from "@/types";
import { CONTRIB_ICON, CONTRIB_TYPE_COLOR } from "./experienceConstants";

interface ModalContributionsProps {
   title: string;
   items: InternalContribution[];
   baseDelay: number;
   variant: "contributions" | "achievements";
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ModalContributions = ({
   title,
   items,
   baseDelay,
   variant,
}: ModalContributionsProps) => {
   if (items.length === 0) return null;

   const isAchievements = variant === "achievements";

   return (
      <motion.div
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: baseDelay, duration: 0.4, ease: EXPO_EASE }}
         style={{
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
         }}
      >
         <p
            style={{
               fontSize: 11,
               color: TEXT_MUTED,
               fontWeight: 600,
               textTransform: "uppercase",
               letterSpacing: "0.06em",
               marginBottom: 12,
            }}
         >
            {title}
         </p>
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 8,
            }}
         >
            {items.map((c) => {
               const Icon = isAchievements
                  ? CONTRIB_ICON[c.type] || GraduationCap
                  : CONTRIB_ICON[c.type] || GraduationCap;
               const color = isAchievements
                  ? AMBER
                  : CONTRIB_TYPE_COLOR[c.type] || AMBER;
               const bgBase = isAchievements
                  ? `rgba(245,158,11,0.03)`
                  : "rgba(255,255,255,0.02)";
               const borderBase = isAchievements
                  ? `rgba(245,158,11,0.08)`
                  : "rgba(255,255,255,0.04)";

               return (
                  <div
                     key={c.title}
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: bgBase,
                        border: `1px solid ${borderBase}`,
                     }}
                  >
                     <div
                        style={{
                           width: 28,
                           height: 28,
                           borderRadius: 8,
                           background: `${color}12`,
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           flexShrink: 0,
                        }}
                     >
                        <Icon size={14} style={{ color }} />
                     </div>
                     <span
                        style={{
                           fontSize: 13,
                           color: TEXT_SECONDARY,
                           flex: 1,
                        }}
                     >
                        {c.title}
                     </span>
                     {c.year && (
                        <span
                           style={{
                              fontSize: 10,
                              color: TEXT_MUTED,
                              fontFamily: MONO_FONT,
                              flexShrink: 0,
                           }}
                        >
                           {c.year}
                        </span>
                     )}
                  </div>
               );
            })}
         </div>
      </motion.div>
   );
};

export default ModalContributions;
