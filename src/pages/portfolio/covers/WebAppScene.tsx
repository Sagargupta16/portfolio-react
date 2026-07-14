import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Full-stack web app: browser frame with an animated dashboard skeleton.
   Variants swap the content panel: placement | language | social | travel. */

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
};

const VARIANT_CHIP: Record<string, string> = {
   placement: "PLACEMENTS",
   language: "TUTORS",
   social: "THREADS",
   travel: "JOURNAL",
};

const PlacementPanel = ({ tint }: { tint: string }) => (
   <div
      style={{
         display: "flex",
         alignItems: "flex-end",
         gap: 6,
         height: 42,
         padding: "0 4px",
      }}
   >
      {[26, 38, 18].map((h, i) => (
         <motion.div
            key={h}
            animate={{ scaleY: [0.3, 1, 1, 0.3] }}
            transition={{
               duration: 4,
               repeat: Infinity,
               delay: i * 0.25,
               times: [0, 0.25, 0.85, 1],
            }}
            style={{
               width: 14,
               height: h,
               borderRadius: "3px 3px 0 0",
               background: i === 1 ? `${tint}80` : `${tint}40`,
               transformOrigin: "bottom",
            }}
         />
      ))}
   </div>
);

const LanguagePanel = ({ tint }: { tint: string }) => (
   <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {/* Two chat bubbles alternating typing dots */}
      {[0, 1].map((side) => (
         <div
            key={side}
            style={{
               alignSelf: side === 0 ? "flex-start" : "flex-end",
               display: "flex",
               gap: 3,
               padding: "5px 8px",
               borderRadius: side === 0 ? "8px 8px 8px 2px" : "8px 8px 2px 8px",
               border: `1px solid ${side === 0 ? "rgba(255,255,255,0.14)" : `${tint}40`}`,
               background: side === 0 ? "rgba(255,255,255,0.04)" : `${tint}0c`,
            }}
         >
            {[0, 1, 2].map((d) => (
               <motion.span
                  key={d}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                     duration: 1.2,
                     repeat: Infinity,
                     delay: side * 1.5 + d * 0.2,
                  }}
                  style={{
                     width: 3,
                     height: 3,
                     borderRadius: "50%",
                     background: "rgba(255,255,255,0.6)",
                  }}
               />
            ))}
         </div>
      ))}
      {/* Live call dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
         <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }}
         />
         <span style={{ ...label, color: "rgba(255,255,255,0.4)" }}>Live call</span>
      </div>
   </div>
);

const SocialPanel = ({ tint }: { tint: string }) => (
   <div
      style={{
         border: "1px solid rgba(255,255,255,0.1)",
         borderRadius: 6,
         padding: "6px 8px",
      }}
   >
      <div style={{ height: 3, width: "70%", borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
      <div style={{ height: 3, width: "45%", borderRadius: 2, background: "rgba(255,255,255,0.1)", marginTop: 3 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 7, alignItems: "center" }}>
         <motion.span
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: tint }}
         />
         <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }}
         />
         {/* threaded reply line */}
         <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      </div>
   </div>
);

const TravelPanel = ({ tint }: { tint: string }) => (
   <div
      style={{
         border: "1px solid rgba(255,255,255,0.1)",
         borderRadius: 6,
         overflow: "hidden",
         position: "relative",
         height: 46,
      }}
   >
      <div className="skeleton" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
      {/* Location pin dropping */}
      <motion.div
         animate={{ y: [-14, 0, 0, -14], opacity: [0, 1, 1, 0] }}
         transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.2, 0.85, 1] }}
         style={{
            position: "absolute",
            left: "46%",
            top: "26%",
            width: 10,
            height: 10,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            background: tint,
         }}
      />
      {/* Like dot */}
      <motion.span
         animate={{ scale: [1, 1.3, 1] }}
         transition={{ duration: 1.8, repeat: Infinity }}
         style={{
            position: "absolute",
            right: 6,
            bottom: 5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
         }}
      />
   </div>
);

const DefaultPanel = ({ tint }: { tint: string }) => (
   <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {[0, 1, 2].map((row) => (
         <motion.div
            key={row}
            animate={{ opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: row * 0.4 }}
            style={{
               height: 8,
               borderRadius: 3,
               border: "1px solid rgba(255,255,255,0.08)",
               background: row === 0 ? `${tint}0c` : "rgba(255,255,255,0.03)",
            }}
         />
      ))}
   </div>
);

const WebAppScene = ({ tint, variant }: CoverSceneProps) => {
   let panel: React.ReactNode;
   if (variant === "placement") panel = <PlacementPanel tint={tint} />;
   else if (variant === "language") panel = <LanguagePanel tint={tint} />;
   else if (variant === "social") panel = <SocialPanel tint={tint} />;
   else if (variant === "travel") panel = <TravelPanel tint={tint} />;
   else panel = <DefaultPanel tint={tint} />;

   const chip = VARIANT_CHIP[variant ?? ""];

   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         {/* Browser window */}
         <div
            style={{
               position: "absolute",
               left: "12%",
               right: "12%",
               top: "12%",
               bottom: "14%",
               borderRadius: 8,
               border: "1px solid rgba(255,255,255,0.12)",
               background: "rgba(255,255,255,0.02)",
               overflow: "hidden",
            }}
         >
            {/* Chrome bar */}
            <div
               style={{
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "0 8px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
               }}
            >
               {[0, 1, 2].map((i) => (
                  <span
                     key={i}
                     style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                     }}
                  />
               ))}
               <div
                  style={{
                     marginLeft: 8,
                     height: 6,
                     width: "40%",
                     borderRadius: 3,
                     background: "rgba(255,255,255,0.06)",
                  }}
               />
            </div>

            {/* App body: sidebar + content */}
            <div style={{ display: "flex", height: "calc(100% - 16px)" }}>
               <div
                  style={{
                     width: 40,
                     borderRight: "1px solid rgba(255,255,255,0.07)",
                     padding: 7,
                     display: "flex",
                     flexDirection: "column",
                     gap: 5,
                  }}
               >
                  {[0, 1, 2].map((i) => (
                     <motion.div
                        key={i}
                        animate={{ opacity: i === 0 ? [0.9, 0.9] : [0.25, 0.5, 0.25] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        style={{
                           height: 5,
                           borderRadius: 2,
                           background: i === 0 ? `${tint}60` : "rgba(255,255,255,0.14)",
                        }}
                     />
                  ))}
               </div>
               <div style={{ flex: 1, padding: 9, display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* Header bar */}
                  <div
                     style={{
                        height: 7,
                        width: "55%",
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.12)",
                     }}
                  />
                  {panel}
               </div>
            </div>
         </div>

         {chip && (
            <span
               style={{
                  ...label,
                  position: "absolute",
                  right: "13%",
                  top: "15%",
                  padding: "2px 6px",
                  borderRadius: 3,
                  border: `1px solid ${tint}35`,
                  background: `${tint}0a`,
                  color: `${tint}cc`,
               }}
            >
               {chip}
            </span>
         )}
      </div>
   );
};

export default WebAppScene;
