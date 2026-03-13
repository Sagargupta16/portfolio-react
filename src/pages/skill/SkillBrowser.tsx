import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { GLASS_PANEL_STYLE } from "@/constants/theme";
import useReducedMotion from "@utils/useReducedMotion";
import SkillBrowserTabs from "./SkillBrowserTabs";
import SkillBrowserGrid from "./SkillBrowserGrid";
import SkillTagGroup from "./SkillTagGroup";

interface Category {
   key: string;
   label: string;
   items: string[];
}

interface SkillBrowserProps {
   categories: Category[];
}

const SkillBrowser = ({ categories }: SkillBrowserProps) => {
   const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "");
   const reducedMotion = useReducedMotion();
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -100px 0px",
   });

   const activeCategory = categories.find((c) => c.key === activeKey);

   // Reduced motion: show all categories stacked (original layout)
   if (reducedMotion) {
      return (
         <div
            style={{ display: "flex", flexDirection: "column", gap: 32 }}
         >
            {categories.map(({ key, label, items }) => (
               <div key={key}>
                  <h3
                     style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#eeeef5",
                        marginBottom: 16,
                     }}
                  >
                     {label}
                  </h3>
                  <SkillTagGroup items={items} />
               </div>
            ))}
         </div>
      );
   }

   return (
      <motion.div
         ref={ref}
         initial={{ opacity: 0, y: 30 }}
         animate={
            isInView
               ? { opacity: 1, y: 0 }
               : { opacity: 0, y: 30 }
         }
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         style={{
            ...GLASS_PANEL_STYLE,
            position: "relative",
         }}
      >
         {/* Top glow line */}
         <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
               isInView
                  ? { scaleX: 1, opacity: 1 }
                  : { scaleX: 0, opacity: 0 }
            }
            transition={{
               duration: 1.2,
               delay: 0.3,
               ease: [0.16, 1, 0.3, 1],
            }}
            style={{
               position: "absolute",
               top: 0,
               left: "10%",
               right: "10%",
               height: 1,
               background:
                  "linear-gradient(90deg, transparent, rgb(var(--ch-cyan) / 0.5), transparent)",
               zIndex: 10,
               transformOrigin: "center",
            }}
         />

         {/* Category tabs */}
         <SkillBrowserTabs
            categories={categories}
            activeKey={activeKey}
            onSelect={setActiveKey}
         />

         {/* Animated skill grid */}
         <AnimatePresence mode="wait">
            {activeCategory && (
               <SkillBrowserGrid
                  key={activeCategory.key}
                  items={activeCategory.items}
                  categoryKey={activeCategory.key}
               />
            )}
         </AnimatePresence>
      </motion.div>
   );
};

export default SkillBrowser;
