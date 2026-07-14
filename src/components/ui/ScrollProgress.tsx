import { motion, useScroll, useSpring } from "motion/react";
import { BLUE } from "@/constants/theme";

const ScrollProgress = () => {
   const { scrollYProgress } = useScroll();
   const scaleX = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
   });

   return (
      <motion.div
         style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: BLUE,
            transformOrigin: "0%",
            scaleX,
            zIndex: 100,
         }}
      />
   );
};

export default ScrollProgress;
