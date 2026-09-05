import { ExternalLink } from "lucide-react";
import { MONO_FONT } from "@/constants/theme";

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
   label = "Source",
   projectName,
   accentColor,
}: ProjectSourceLinkProps) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${projectName} source on GitHub (opens in a new tab)`}
      style={{
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
         fontSize: 10,
         lineHeight: 1.4,
         textDecoration: "none",
      }}
   >
      <ExternalLink size={11} style={{ flexShrink: 0 }} />
      {label}
   </a>
);

export default ProjectSourceLink;
