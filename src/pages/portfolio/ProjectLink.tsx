import type { ComponentType } from "react";
import { CYAN, TEXT_SECONDARY } from "@/constants/theme";

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
   accentColor = CYAN,
}: ProjectLinkProps) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
         display: "inline-flex",
         alignItems: "center",
         gap: 4,
         padding: "4px 12px",
         borderRadius: 10,
         fontSize: 12,
         fontWeight: 500,
         color: TEXT_SECONDARY,
         border: "1px solid rgba(255, 255, 255, 0.06)",
         background: "rgba(255, 255, 255, 0.03)",
         textDecoration: "none",
         transition: "color 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = accentColor;
         e.currentTarget.style.borderColor = `${accentColor}4D`;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = TEXT_SECONDARY;
         e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
      aria-label={ariaLabel}
   >
      <Icon size={14} />
      {label}
   </a>
);

export default ProjectLink;
