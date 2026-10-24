import { motion } from "motion/react";
import {
   GitPullRequest,
   GitMerge,
   CircleDot,
   GitPullRequestClosed,
   BadgeCheck,
   MessageCircle,
} from "lucide-react";
import { getSectionCopy } from "@data/sections";
import {
   MONO_FONT,
   BLUE_LIGHT,
   GREEN,
   ORANGE,
   SKY,
   DURATION,
   EASING,
} from "@/constants/theme";
import { staggerContainer, staggerItem } from "@utils/animations";
import { fillTemplate } from "@utils/fillTemplate";
import {
   OPEN_SOURCE_CONTRIBUTIONS,
   COMMUNITY_DISCUSSIONS,
} from "./projectConstants";
import ContribSection from "./ContribSection";
import DiscussionCard from "./DiscussionCard";

const COPY = getSectionCopy("projects");

const OpenSourceBanner = () => {
   const merged = OPEN_SOURCE_CONTRIBUTIONS.filter(
      (c) => c.status === "merged",
   );
   const open = OPEN_SOURCE_CONTRIBUTIONS.filter((c) => c.status === "open");
   const closed = OPEN_SOURCE_CONTRIBUTIONS.filter(
      (c) => c.status === "closed",
   );
   const acceptedDiscussions = COMMUNITY_DISCUSSIONS.filter(
      (d) => d.status === "accepted",
   );
   const helpfulDiscussions = COMMUNITY_DISCUSSIONS.filter(
      (d) => d.status === "helpful",
   );

   return (
      <motion.div
         style={{ marginTop: 48 }}
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "0px 0px -100px 0px" }}
         transition={{ duration: DURATION.slow, ease: EASING.standard }}
      >
         <div className="subsection-heading">
            <GitPullRequest
               size={22}
               style={{ color: GREEN }}
               aria-hidden="true"
            />
            <h3>{COPY.subsections.open_source}</h3>
            <span className="subsection-count">
               {OPEN_SOURCE_CONTRIBUTIONS.length + COMMUNITY_DISCUSSIONS.length}
            </span>
         </div>

         <div
            className="glass-card"
            style={{
               padding: 16,
               border: "1px solid rgb(var(--ch-green) / 0.2)",
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
                     "linear-gradient(135deg, rgb(var(--ch-sky) / 0.3), rgb(var(--ch-green) / 0.3), rgb(var(--ch-blue-light) / 0.3))",
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
                     label={COPY.open_source.merged}
                     count={merged.length}
                     color={SKY}
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
                              "linear-gradient(to right, transparent, rgb(var(--ch-white) / 0.06), transparent)",
                           marginBottom: 16,
                        }}
                     />
                  )}
                  <ContribSection
                     icon={CircleDot}
                     label={COPY.open_source.open}
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
                           "linear-gradient(to right, transparent, rgb(var(--ch-white) / 0.06), transparent)",
                        marginBottom: 16,
                        marginTop: 4,
                     }}
                  />
                  <ContribSection
                     icon={GitPullRequestClosed}
                     label={COPY.open_source.closed}
                     count={closed.length}
                     color={ORANGE}
                     items={closed}
                  />
               </>
            )}

            {acceptedDiscussions.length > 0 && (
               <>
                  <div
                     style={{
                        height: 1,
                        background:
                           "linear-gradient(to right, transparent, rgb(var(--ch-white) / 0.06), transparent)",
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
                     <BadgeCheck size={14} style={{ color: BLUE_LIGHT }} />
                     <span
                        style={{
                           fontSize: 12,
                           fontWeight: 700,
                           color: BLUE_LIGHT,
                           fontFamily: MONO_FONT,
                           letterSpacing: "0.03em",
                        }}
                     >
                        {fillTemplate(COPY.open_source.accepted, {
                           count: acceptedDiscussions.length,
                        })}
                     </span>
                  </div>
                  <motion.div
                     className="contribution-grid"
                     variants={staggerContainer}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  >
                     {acceptedDiscussions.map((d) => (
                        <motion.div key={d.url} variants={staggerItem}>
                           <DiscussionCard discussion={d} />
                        </motion.div>
                     ))}
                  </motion.div>
               </>
            )}

            {helpfulDiscussions.length > 0 && (
               <>
                  <div
                     style={{
                        height: 1,
                        background:
                           "linear-gradient(to right, transparent, rgb(var(--ch-white) / 0.06), transparent)",
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
                     <MessageCircle size={14} style={{ color: SKY }} />
                     <span
                        style={{
                           fontSize: 12,
                           fontWeight: 700,
                           color: SKY,
                           fontFamily: MONO_FONT,
                           letterSpacing: "0.03em",
                        }}
                     >
                        {fillTemplate(COPY.open_source.helpful, {
                           count: helpfulDiscussions.length,
                        })}
                     </span>
                  </div>
                  <motion.div
                     className="contribution-grid"
                     variants={staggerContainer}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  >
                     {helpfulDiscussions.map((d) => (
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
