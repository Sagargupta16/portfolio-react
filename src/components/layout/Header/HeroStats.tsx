import { useMemo } from "react";
import { motion } from "motion/react";
import { getStatistics } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import AnimatedCounter from "@components/ui/AnimatedCounter";

const HeroStats = () => {
   const statistics = useMemo(() => getStatistics(), []);

   const statsArray = useMemo(() => {
      return Object.entries(statistics).map(([key, value]) => ({
         key,
         label: key
            .replaceAll("_", " ")
            .replaceAll(/\b\w/g, (c) => c.toUpperCase()),
         value,
      }));
   }, [statistics]);

   return (
      <motion.div
         className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-2"
         variants={staggerItem}
      >
         {statsArray.map((stat) => (
            <div key={stat.key} className="flex flex-col items-center gap-1.5">
               <AnimatedCounter value={stat.value} duration={2} />
               <span className="text-text-muted text-xs md:text-sm font-medium tracking-wide uppercase">
                  {stat.label}
               </span>
            </div>
         ))}
      </motion.div>
   );
};

export default HeroStats;
