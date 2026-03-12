import type { ComponentType } from "react";

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
   accentColor = "#06b6d4",
}: ProjectLinkProps) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
         display: "inline-flex",
         alignItems: "center",
         gap: 6,
         padding: "6px 14px",
         borderRadius: 8,
         fontSize: 12,
         fontWeight: 500,
         color: "#a5a5c0",
         border: "1px solid rgba(255, 255, 255, 0.06)",
         background: "rgba(255, 255, 255, 0.03)",
         backdropFilter: "blur(8px)",
         textDecoration: "none",
         transition: "all 0.2s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = accentColor;
         e.currentTarget.style.borderColor = `${accentColor}4D`;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = "#a5a5c0";
         e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
      aria-label={ariaLabel}
   >
      <Icon size={14} />
      {label}
   </a>
);

export default ProjectLink;
