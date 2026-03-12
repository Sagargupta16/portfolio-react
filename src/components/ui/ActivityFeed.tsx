import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { GitCommit, ExternalLink } from "lucide-react";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY, CYAN } from "@/constants/theme";

interface FeedItem {
   message: string;
   hash: string;
   repo: string;
   time: string;
   url?: string;
}

interface ActivityFeedProps {
   items: FeedItem[];
   title?: string;
}

const ActivityFeed = ({
   items,
   title = "Recent Activity",
}: ActivityFeedProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -60px 0px",
   });

   return (
      <motion.div
         ref={ref}
         initial={{ opacity: 0, y: 30 }}
         animate={isInView ? { opacity: 1, y: 0 } : {}}
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgb(var(--ch-white) / 0.06)",
            background: "rgb(var(--ch-glass) / 0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
         }}
      >
         {/* Header */}
         <div
            style={{
               padding: "10px 16px",
               borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
               background: "rgb(var(--ch-bg-sec) / 0.8)",
               fontFamily: MONO_FONT,
               fontSize: 11,
               color: TEXT_MUTED,
               textTransform: "uppercase",
               letterSpacing: "0.05em",
            }}
         >
            {title}
         </div>

         {/* Feed items */}
         <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {items.map((item, i) => (
               <motion.a
                  key={item.hash}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                     delay: 0.3 + i * 0.08,
                     duration: 0.4,
                     ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                     display: "block",
                     padding: "12px 16px",
                     borderBottom: "1px solid rgb(var(--ch-white) / 0.03)",
                     cursor: item.url ? "pointer" : "default",
                     transition: "background 0.2s ease",
                     textDecoration: "none",
                  }}
                  whileHover={{
                     backgroundColor: "rgba(var(--ch-cyan), 0.04)",
                  }}
               >
                  <div
                     style={{
                        fontSize: 13,
                        color: TEXT_SECONDARY,
                        lineHeight: 1.4,
                        marginBottom: 6,
                     }}
                  >
                     {item.message}
                  </div>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: MONO_FONT,
                        fontSize: 11,
                        color: TEXT_MUTED,
                        flexWrap: "wrap",
                     }}
                  >
                     <span
                        style={{
                           background: "rgb(var(--ch-cyan) / 0.1)",
                           padding: "1px 6px",
                           borderRadius: 4,
                           color: CYAN,
                        }}
                     >
                        {item.hash}
                     </span>
                     <span style={{ opacity: 0.4 }}>&#183;</span>
                     <GitCommit size={11} style={{ opacity: 0.5 }} />
                     <span>{item.repo}</span>
                     <span style={{ opacity: 0.4 }}>&#183;</span>
                     <span>{item.time}</span>
                     {item.url && (
                        <ExternalLink
                           size={10}
                           style={{ opacity: 0.3, marginLeft: "auto" }}
                        />
                     )}
                  </div>
               </motion.a>
            ))}
         </div>
      </motion.div>
   );
};

export default ActivityFeed;
