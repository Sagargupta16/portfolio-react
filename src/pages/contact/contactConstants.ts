import type { ComponentType } from "react";
import { Mail, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LinkedinIcon, InstagramIcon, GitHubIcon } from "./ContactIcons";
import type { IconStyleProps } from "./ContactIcons";

interface ContactColors {
   accent: string;
   bg: string;
   border: string;
}

const CONTACT_COLORS: Record<string, ContactColors> = {
   email: {
      accent: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
      border: "rgba(96,165,250,0.15)",
   },
   linkedin: {
      accent: "#0a66c2",
      bg: "rgba(10,102,194,0.08)",
      border: "rgba(10,102,194,0.15)",
   },
   instagram: {
      accent: "#e1306c",
      bg: "rgba(225,48,108,0.08)",
      border: "rgba(225,48,108,0.15)",
   },
   calendar: {
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.15)",
   },
   github: {
      accent: "#a5a5c0",
      bg: "rgba(165,165,192,0.08)",
      border: "rgba(165,165,192,0.15)",
   },
};

export interface ContactMeta {
   Icon: ComponentType<IconStyleProps> | LucideIcon;
   colors: ContactColors;
}

export const DEFAULT_CONTACT_META: ContactMeta = {
   Icon: Mail,
   colors: CONTACT_COLORS.email,
};

export const CONTACT_META: Record<string, ContactMeta> = {
   MdOutlineEmail: DEFAULT_CONTACT_META,
   BsLinkedin: { Icon: LinkedinIcon, colors: CONTACT_COLORS.linkedin },
   FiInstagram: { Icon: InstagramIcon, colors: CONTACT_COLORS.instagram },
   FiCalendar: { Icon: Calendar, colors: CONTACT_COLORS.calendar },
   FiGithub: { Icon: GitHubIcon, colors: CONTACT_COLORS.github },
};

export interface FormData {
   name: string;
   email: string;
   message: string;
}

export interface Status {
   type: "" | "error";
   message: string;
   field?: "email";
}
