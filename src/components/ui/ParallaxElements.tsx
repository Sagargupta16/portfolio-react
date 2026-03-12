import {
   motion,
   useScroll,
   useTransform,
   type MotionValue,
} from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import useMediaQuery from "@utils/useMediaQuery";
import ShapeRenderer from "./ShapeRenderer";
import { ELEMENTS, type ParallaxElementShape } from "./parallaxData";

interface ParallaxElementProps {
   element: ParallaxElementShape;
   scrollYProgress: MotionValue<number>;
}

const ParallaxElement = ({
   element,
   scrollYProgress,
}: ParallaxElementProps) => {
   const y = useTransform(scrollYProgress, [0, 1], [0, element.speed]);

   const position: React.CSSProperties = {
      position: "absolute",
      top: element.top,
      left: element.left,
      right: element.right,
   };

   return (
      <motion.div style={{ ...position, y }}>
         <ShapeRenderer
            type={element.type}
            size={element.size}
            color={element.color}
            rotation={element.rotation}
         />
      </motion.div>
   );
};

const ParallaxElements = () => {
   const reducedMotion = useReducedMotion();
   const isMobile = useMediaQuery("(max-width: 768px)");
   const { scrollYProgress } = useScroll();

   if (reducedMotion || isMobile) return null;

   return (
      <div
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
         }}
         aria-hidden="true"
      >
         {ELEMENTS.map((el) => (
            <ParallaxElement
               key={el.id}
               element={el}
               scrollYProgress={scrollYProgress}
            />
         ))}
      </div>
   );
};

export default ParallaxElements;
