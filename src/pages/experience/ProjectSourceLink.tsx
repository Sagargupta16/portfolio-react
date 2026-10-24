import { ExternalLink } from "lucide-react";
import { getSectionCopy } from "@data/sections";
import { newTabLabel } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import { MEDIA_QUERIES, MONO_FONT, TOUCH_HIT_AREA } from "@/constants/theme";
import useMediaQuery from "@hooks/useMediaQuery";

interface ProjectSourceLinkProps {
   href: string;
   /** Short label, e.g. the org the artifact is published under. */
   label?: string;
   /** Project name, used for the accessible label only. */
   projectName: string;
   accentColor: string;
}

/**
 * Link to the public artifact of a piece of work, for the projects inside an
 * experience entry. Most client work has none; the ones that do are the strongest
 * evidence on the page, so the link sits on the claim rather than in a separate
 * section.
 */
const ProjectSourceLink = ({
   href,
   label = getSectionCopy("experience").links.source,
   projectName,
   accentColor,
}: ProjectSourceLinkProps) => {
   // The pill is about 26 px tall. On touch, the shared hit area makes its
   // tap target at least 44 x 44 px without changing how it looks (same
   // pattern as the Stats card View links).
   const coarsePointer = useMediaQuery(MEDIA_QUERIES.coarse);

   return (
      <a
         href={href}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={newTabLabel(
            fillTemplate(getSectionCopy("experience").links.source_label, {
               name: projectName,
            }),
         )}
         style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginTop: 10,
            padding: "5px 10px",
            borderRadius: 8,
            border: `1px solid ${accentColor}40`,
            background: `${accentColor}12`,
            color: accentColor,
            fontFamily: MONO_FONT,
            fontSize: 11,
            lineHeight: 1.4,
            textDecoration: "none",
         }}
      >
         {coarsePointer && <span aria-hidden="true" style={TOUCH_HIT_AREA} />}
         <ExternalLink size={11} style={{ flexShrink: 0 }} />
         {label}
      </a>
   );
};

export default ProjectSourceLink;
