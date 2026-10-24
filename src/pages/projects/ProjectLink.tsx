import type { ComponentType, CSSProperties } from "react";
import { BLUE_LIGHT } from "@/constants/theme";
import { newTabLabel } from "@data/ui";

interface ProjectLinkProps {
   href: string;
   label: string;
   ariaLabel: string;
   icon: ComponentType<{ size?: number }>;
   accentColor?: string;
}

const ProjectLink = ({
   href,
   label,
   ariaLabel,
   icon: Icon,
   accentColor = BLUE_LIGHT,
}: ProjectLinkProps) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="project-action"
      style={{ "--project-accent": accentColor } as CSSProperties}
      aria-label={newTabLabel(ariaLabel)}
   >
      <span aria-hidden="true">
         <Icon size={16} />
      </span>
      {label}
   </a>
);

export default ProjectLink;
