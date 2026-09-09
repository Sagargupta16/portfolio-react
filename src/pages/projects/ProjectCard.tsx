import type { CSSProperties, Ref } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { DURATION, EASING } from "@/constants/theme";
import { VIEWPORT_MARGIN } from "@utils/animations";
import { hasProjectUrl } from "@utils/projectMetadata";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   getCategoryColors,
   type ProjectWithCategory,
} from "./projectConstants";
import ProjectLink from "./ProjectLink";
import ProjectCardHeader from "./ProjectCardHeader";
import ProjectCover from "./covers/ProjectCover";

interface ProjectCardProps {
   data: ProjectWithCategory;
   index?: number;
   /** Mounted by a filter change (short rise, index stagger), not the first scroll reveal. */
   entering?: boolean;
   spotlight?: boolean;
   onOpen?: () => void;
   /** AnimatePresence popLayout measures and pins the leaving card through this ref. */
   ref?: Ref<HTMLDivElement>;
}

const MAX_VISIBLE_TAGS = 5;

// Hover lift; whileFocus gets the same target so keyboard focus matches.
const CARD_LIFT = {
   y: -6,
   transition: { duration: DURATION.quick, ease: EASING.brisk },
};

// Survivors glide to their new grid slot on a spring. Position only: the card
// is never scaled, so the 16:10 cover and the text keep their boxes mid-flight.
const LAYOUT_SPRING: Transition = {
   type: "spring",
   stiffness: 300,
   damping: 30,
};

// Roughly one viewport of cards; the stagger restarts per row so a row that
// scrolls in later still ripples instead of waiting out the whole list.
const CARDS_PER_VIEWPORT = 6;

// First scroll reveal: a taller rise, 50ms per card.
const REVEAL = { rise: 24, duration: 0.5, step: 0.05, cap: 0.3 };
// Filter swap entry: a short rise into the gap, 40ms per card.
const ENTER = { rise: 12, duration: DURATION.default, step: 0.04, cap: 0.24 };

// Exit at 75% of the entrance, easing in. popLayout lifts the card out of the
// flow first, so the survivors start gliding on the same frame.
const CARD_EXIT: TargetAndTransition = {
   opacity: 0,
   scale: 0.96,
   transition: { duration: 0.3, ease: "easeIn" },
};

const ProjectCard = ({
   data,
   index = 0,
   entering = false,
   spotlight = false,
   onOpen,
   ref,
}: ProjectCardProps) => {
   const { reducedMotion } = useMotionPreference();
   const hasGithub = hasProjectUrl(data.github);
   const hasLive = hasProjectUrl(data.live);
   const colors = getCategoryColors(data.category);
   const isFeatured = data.category === "Featured";
   const isCollab = data.category === "Collab";

   const hasDetail =
      (data.features?.length ?? 0) > 0 ||
      (data.contributors?.length ?? 0) > 0 ||
      Boolean(data.description);
   const clickable = hasDetail && Boolean(onOpen);

   const visibleTags = data.tools_tech.slice(0, MAX_VISIBLE_TAGS);
   const hiddenTagCount = data.tools_tech.length - visibleTags.length;
   const lift = reducedMotion ? undefined : CARD_LIFT;
   const entrance = entering ? ENTER : REVEAL;
   const delay = Math.min(
      (index % CARDS_PER_VIEWPORT) * entrance.step,
      entrance.cap,
   );

   return (
      <motion.div
         ref={ref}
         className={`glass-card project-card${spotlight ? " project-card--spotlight" : ""}`}
         style={{ "--project-accent": colors.accent } as CSSProperties}
         layout="position"
         initial={{ opacity: 0, y: entrance.rise }}
         whileInView={{
            opacity: 1,
            y: 0,
            transition: {
               duration: entrance.duration,
               ease: EASING.cinematic,
               delay,
            },
         }}
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         exit={CARD_EXIT}
         // The stagger lives on the reveal target above, so this default never
         // delays the hover return or the exit.
         transition={{
            duration: DURATION.quick,
            ease: EASING.brisk,
            layout: LAYOUT_SPRING,
         }}
         whileHover={lift}
         whileFocus={lift}
      >
         {/* Media: live screenshot or animated scene */}
         <ProjectCover
            projectId={data.id}
            title={data.title}
            accent={colors.accent}
         />

         <div className="project-card-body">
            <ProjectCardHeader
               data={data}
               isFeatured={isFeatured}
               isCollab={isCollab}
               spotlight={spotlight}
            />

            {/* Description (clamped -- full text lives in the modal) */}
            <p className="project-card-summary">{data.description}</p>

            {/* Tech tags */}
            <div className="project-card-tags">
               {visibleTags.map((tool) => (
                  <span key={`${data.id}-tool-${tool}`}>{tool}</span>
               ))}
               {hiddenTagCount > 0 && (
                  <span className="project-card-more-tags">
                     +{hiddenTagCount}
                  </span>
               )}
            </div>

            {/* Links */}
            {(clickable || hasGithub || hasLive) && (
               <div className="project-card-actions">
                  {clickable && (
                     <button
                        type="button"
                        onClick={onOpen}
                        className="project-action project-action--primary"
                        aria-label={`View details for ${data.title}`}
                     >
                        Details
                        <ArrowRight
                           size={16}
                           className="action-arrow"
                           aria-hidden="true"
                        />
                     </button>
                  )}
                  {hasGithub && (
                     <ProjectLink
                        href={data.github}
                        label="Source"
                        ariaLabel={`View ${data.title} on GitHub`}
                        icon={FaGithub}
                        accentColor={colors.accent}
                     />
                  )}
                  {hasLive && (
                     <ProjectLink
                        href={data.live}
                        label="Live Demo"
                        ariaLabel={`View ${data.title} live demo`}
                        icon={ExternalLink}
                        accentColor={colors.accent}
                     />
                  )}
               </div>
            )}
         </div>
      </motion.div>
   );
};

export default ProjectCard;
