import { memo } from "react";
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
import type { CommunityDiscussion, OpenSourceContribution } from "@/types";
import {
   BLUE_LIGHT,
   GREEN,
   ORANGE,
   SKY,
   DURATION,
   EASING,
} from "@/constants/theme";
import { fillTemplate } from "@utils/fillTemplate";
import {
   OPEN_SOURCE_CONTRIBUTIONS,
   COMMUNITY_DISCUSSIONS,
} from "./projectConstants";
import ContribCard from "./ContribCard";
import ContribSection from "./ContribSection";
import DiscussionCard from "./DiscussionCard";

const COPY = getSectionCopy("projects");

const countLabel = (label: string, count: number) => `${label} (${count})`;

const renderContrib = (contrib: OpenSourceContribution) => (
   <ContribCard contrib={contrib} />
);
const renderDiscussion = (discussion: CommunityDiscussion) => (
   <DiscussionCard discussion={discussion} />
);

/** Hairline between two groups; `marginTop` is set on all but the first. */
const Divider = ({ marginTop }: { marginTop?: number }) => (
   <div
      style={{
         height: 1,
         background:
            "linear-gradient(to right, transparent, rgb(var(--ch-white) / 0.06), transparent)",
         marginBottom: 16,
         marginTop,
      }}
   />
);

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
                     label={countLabel(COPY.open_source.merged, merged.length)}
                     color={SKY}
                     items={merged}
                     renderItem={renderContrib}
                  />
               </div>
            )}

            {open.length > 0 && (
               <>
                  {merged.length > 0 && <Divider />}
                  <ContribSection
                     icon={CircleDot}
                     label={countLabel(COPY.open_source.open, open.length)}
                     color={GREEN}
                     items={open}
                     renderItem={renderContrib}
                  />
               </>
            )}

            {closed.length > 0 && (
               <>
                  <Divider marginTop={4} />
                  <ContribSection
                     icon={GitPullRequestClosed}
                     label={countLabel(COPY.open_source.closed, closed.length)}
                     color={ORANGE}
                     items={closed}
                     renderItem={renderContrib}
                  />
               </>
            )}

            {acceptedDiscussions.length > 0 && (
               <>
                  <Divider marginTop={4} />
                  <ContribSection
                     icon={BadgeCheck}
                     label={fillTemplate(COPY.open_source.accepted, {
                        count: acceptedDiscussions.length,
                     })}
                     color={BLUE_LIGHT}
                     items={acceptedDiscussions}
                     renderItem={renderDiscussion}
                  />
               </>
            )}

            {helpfulDiscussions.length > 0 && (
               <>
                  <Divider marginTop={4} />
                  <ContribSection
                     icon={MessageCircle}
                     label={fillTemplate(COPY.open_source.helpful, {
                        count: helpfulDiscussions.length,
                     })}
                     color={SKY}
                     items={helpfulDiscussions}
                     renderItem={renderDiscussion}
                  />
               </>
            )}
         </div>
      </motion.div>
   );
};

export default memo(OpenSourceBanner);
