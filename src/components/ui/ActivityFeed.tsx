import { motion } from "motion/react";
import { GitCommit, ExternalLink } from "lucide-react";
import {
   MONO_FONT,
   TEXT_MUTED,
   TEXT_SECONDARY,
   CYAN,
   GLASS_PANEL_STYLE,
   CHROME_BAR_STYLE,
} from "@/constants/theme";
import {
   PANEL_INITIAL,
   PANEL_VISIBLE,
   PANEL_TRANSITION,
} from "@utils/animations";
import useRevealInView from "@utils/useRevealInView";

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
   const { ref, isInView } = useRevealInView();

   return (
      <motion.div
         ref={ref}
         initial={PANEL_INITIAL}
         animate={isInView ? PANEL_VISIBLE : {}}
         transition={PANEL_TRANSITION}
         style={GLASS_PANEL_STYLE}
      >
         {/* Header */}
         <div
            style={{
               ...CHROME_BAR_STYLE,
               padding: "10px 16px",
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
