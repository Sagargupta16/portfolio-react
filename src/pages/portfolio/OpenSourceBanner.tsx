import { motion } from "motion/react";
import { GitPullRequest, GitMerge, CircleDot, GitPullRequestClosed, BadgeCheck } from "lucide-react";
import {
   MONO_FONT,
   CYAN,
   GREEN,
   PURPLE,
   TEXT_PRIMARY,
   TEXT_MUTED,
} from "@/constants/theme";
import { staggerContainer, staggerItem } from "@utils/animations";
import { OPEN_SOURCE_CONTRIBUTIONS, COMMUNITY_DISCUSSIONS } from "./portfolioConstants";
import ContribSection from "./ContribSection";
import DiscussionCard from "./DiscussionCard";

const OpenSourceBanner = () => {
   const merged = OPEN_SOURCE_CONTRIBUTIONS.filter(
      (c) => c.status === "merged",
   );
   const open = OPEN_SOURCE_CONTRIBUTIONS.filter((c) => c.status === "open");
   const closed = OPEN_SOURCE_CONTRIBUTIONS.filter(
      (c) => c.status === "closed",
   );

   return (
      <motion.div
         style={{ marginTop: 64 }}
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ margin: "0px 0px -100px 0px" }}
         transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 10,
               marginBottom: 24,
               justifyContent: "center",
            }}
         >
            <GitPullRequest size={20} style={{ color: GREEN }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY }}>
               Open Source Contributions
            </h3>
            <span
               style={{
                  fontSize: 12,
                  fontFamily: MONO_FONT,
                  color: TEXT_MUTED,
                  fontWeight: 500,
               }}
            >
               ({OPEN_SOURCE_CONTRIBUTIONS.length + COMMUNITY_DISCUSSIONS.length})
            </span>
         </div>

         <div
            className="glass-card"
            style={{
               padding: 24,
               border: "1px solid rgba(34,197,94,0.2)",
               position: "relative",
               overflow: "hidden",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  padding: 1,
                  background:
                     "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,197,94,0.3), rgba(6,182,212,0.3))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMask:
                     "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  pointerEvents: "none",
               }}
            />

            {merged.length > 0 && (
               <div style={{ marginBottom: open.length > 0 ? 20 : 0 }}>
                  <ContribSection
                     icon={GitMerge}
                     label="Merged"
                     count={merged.length}
                     color={PURPLE}
                     items={merged}
                  />
               </div>
            )}

            {open.length > 0 && (
               <>
                  {merged.length > 0 && (
                     <div
                        style={{
                           height: 1,
                           background:
                              "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
                           marginBottom: 16,
                        }}
                     />
                  )}
                  <ContribSection
                     icon={CircleDot}
                     label="Under Review"
                     count={open.length}
                     color={GREEN}
                     items={open}
                  />
               </>
            )}

            {closed.length > 0 && (
               <>
                  <div
                     style={{
                        height: 1,
                        background:
                           "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
                        marginBottom: 16,
                        marginTop: 4,
                     }}
                  />
                  <ContribSection
                     icon={GitPullRequestClosed}
                     label="Community Impact"
                     count={closed.length}
                     color="#f97316"
                     items={closed}
                  />
               </>
            )}

            {COMMUNITY_DISCUSSIONS.length > 0 && (
               <>
                  <div
                     style={{
                        height: 1,
                        background:
                           "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
                        marginBottom: 16,
                        marginTop: 4,
                     }}
                  />
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                     }}
                  >
                     <BadgeCheck size={14} style={{ color: CYAN }} />
                     <span
                        style={{
                           fontSize: 12,
                           fontWeight: 700,
                           color: CYAN,
                           fontFamily: MONO_FONT,
                           letterSpacing: "0.03em",
                        }}
                     >
                        Accepted Answers ({COMMUNITY_DISCUSSIONS.length})
                     </span>
                  </div>
                  <motion.div
                     style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 10,
                     }}
                     variants={staggerContainer}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  >
                     {COMMUNITY_DISCUSSIONS.map((d) => (
                        <motion.div key={d.url} variants={staggerItem}>
                           <DiscussionCard discussion={d} />
                        </motion.div>
                     ))}
                  </motion.div>
               </>
            )}
         </div>
      </motion.div>
   );
};

export default OpenSourceBanner;
