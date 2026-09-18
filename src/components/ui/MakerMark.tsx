import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import maker from "@assets/brand/maker.json";
import styles from "./MakerMark.module.css";

interface MakerMarkProps {
   size?: CSSProperties["width"];
   /** Only the hero opts into expression changes. Other brand marks stay still. */
   animated?: boolean;
}

const MakerArtwork = () => (
   <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
   >
      <path fill={maker.color} d={maker.silhouette} />
      <path fill={maker.ink} d={maker.crest} />
      <path fill={maker.ink} d={maker.visor} />
      <g className={styles.eyes} fill={maker.eyeColor}>
         {maker.eyes.map((eye, index) => (
            <rect
               key={eye.x}
               {...eye}
               className={index === 1 ? styles.rightEye : undefined}
            />
         ))}
         <path
            className={styles.wink}
            d={maker.wink}
            fill="none"
            stroke={maker.eyeColor}
            strokeWidth="3.8"
            strokeLinecap="round"
         />
      </g>
   </svg>
);

const AnimatedMaker = ({ size }: Pick<MakerMarkProps, "size">) => {
   const ref = useRef<HTMLSpanElement>(null);
   const inView = useInView(ref, { amount: 0.5 });
   const { reducedMotion } = useMotionPreference();
   const [pageVisible, setPageVisible] = useState(
      () => typeof document === "undefined" || !document.hidden,
   );

   useEffect(() => {
      const syncVisibility = () => setPageVisible(!document.hidden);
      document.addEventListener("visibilitychange", syncVisibility);
      return () =>
         document.removeEventListener("visibilitychange", syncVisibility);
   }, []);

   return (
      <span
         ref={ref}
         className={styles.mark}
         style={{ width: size, height: size }}
         data-animated={!reducedMotion}
         data-active={inView && pageVisible}
         aria-hidden="true"
      >
         <MakerArtwork />
      </span>
   );
};

/** Decorative brand artwork; the containing home link/button owns its label. */
const MakerMark = ({ size = 36, animated = false }: MakerMarkProps) =>
   animated ? (
      <AnimatedMaker size={size} />
   ) : (
      <span
         className={styles.mark}
         style={{ width: size, height: size }}
         aria-hidden="true"
      >
         <MakerArtwork />
      </span>
   );

export default MakerMark;
