import { useEffect, useId, useRef } from "react";
import { motion, useTransform } from "motion/react";
import usePointerLook from "@hooks/usePointerLook";
import useMotionPreference from "@hooks/useMotionPreference";
import portrait from "@assets/brand/sagar-3d.webp";
import depthMap from "@assets/brand/sagar-3d-depth.webp";

/* 3D-rendered portrait (generated from his photos with Stability Control
   Structure on Bedrock, background removed). The head turns toward the
   pointer with per-pixel depth parallax: an SVG feDisplacementMap reads a
   depth map (Depth Anything V2) so the nose and glasses shift further than
   the ears and hair while the shoulders stay put. R/G carry depth for the X/Y
   passes, B is a neutral 0.5 channel. A small perspective tilt and the slow
   CSS float (.sagar-face) add to it; hover or tap squashes it like
   palakonweb.in's mascot. No WebGL. Decorative only. */

/** Peak nose shift at full reach, as a fraction of the rendered size. */
const PARALLAX = 0.05;
const MAX_TILT = 6; // degrees
const SQUASH = {
   scaleX: [1, 1.1, 0.95, 1.03, 1],
   scaleY: [1, 0.86, 1.08, 0.97, 1],
   transition: { duration: 0.55, ease: "easeOut" as const },
};

interface SagarFaceProps {
   size: number;
}

const SagarFace = ({ size }: SagarFaceProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const passXRef = useRef<SVGFEDisplacementMapElement>(null);
   const passYRef = useRef<SVGFEDisplacementMapElement>(null);
   const { reducedMotion } = useMotionPreference();
   // Unit look vector in [-1, 1]; springs live in the hook.
   const look = usePointerLook(ref, 1, 0);
   const rotateY = useTransform(look.x, (v) => v * MAX_TILT);
   const rotateX = useTransform(look.y, (v) => -v * MAX_TILT);
   const filterId = `${useId().replaceAll(":", "")}-depth`;

   useEffect(() => {
      // displacement = scale * (depth - 0.5); depth peaks near 1 at the nose,
      // so the nose moves scale / 2 px. Negative scale moves content toward
      // the pointer.
      const peak = size * PARALLAX * 2;
      const setX = (v: number) =>
         passXRef.current?.setAttribute("scale", String(-v * peak));
      const setY = (v: number) =>
         passYRef.current?.setAttribute("scale", String(-v * peak));
      const offX = look.x.on("change", setX);
      const offY = look.y.on("change", setY);
      return () => {
         offX();
         offY();
      };
   }, [look.x, look.y, size]);

   return (
      <div
         ref={ref}
         className="sagar-face"
         style={{ width: size, height: size, perspective: 600 }}
      >
         <motion.svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            aria-hidden="true"
            focusable="false"
            style={{ display: "block", rotateX, rotateY, originY: 0.7 }}
            whileHover={reducedMotion ? undefined : SQUASH}
            whileTap={reducedMotion ? undefined : SQUASH}
         >
            <defs>
               <filter
                  id={filterId}
                  filterUnits="userSpaceOnUse"
                  primitiveUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={size}
                  height={size}
                  colorInterpolationFilters="sRGB"
               >
                  <feImage
                     href={depthMap}
                     x="0"
                     y="0"
                     width={size}
                     height={size}
                     preserveAspectRatio="none"
                     result="depth"
                  />
                  <feDisplacementMap
                     ref={passXRef}
                     in="SourceGraphic"
                     in2="depth"
                     scale="0"
                     xChannelSelector="R"
                     yChannelSelector="B"
                     result="shiftedX"
                  />
                  <feDisplacementMap
                     ref={passYRef}
                     in="shiftedX"
                     in2="depth"
                     scale="0"
                     xChannelSelector="B"
                     yChannelSelector="G"
                  />
               </filter>
            </defs>
            <image
               href={portrait}
               width={size}
               height={size}
               filter={`url(#${filterId})`}
            />
         </motion.svg>
      </div>
   );
};

export default SagarFace;
