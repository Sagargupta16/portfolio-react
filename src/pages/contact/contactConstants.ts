import type { ComponentType } from "react";
import { Mail, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LinkedinIcon, InstagramIcon, GitHubIcon } from "./ContactIcons";
import type { IconStyleProps } from "./ContactIcons";
export type { IconStyleProps } from "./ContactIcons";

export interface ContactColors {
   accent: string;
   bg: string;
   border: string;
}

export const CONTACT_COLORS: Record<string, ContactColors> = {
   email: {
      accent: "#06b6d4",
      bg: "rgba(6,182,212,0.08)",
      border: "rgba(6,182,212,0.15)",
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

export const getContactMeta = (title: string): ContactMeta => {
   const t = title.toLowerCase();
   if (t.includes("email")) return { Icon: Mail, colors: CONTACT_COLORS.email };
   if (t.includes("linkedin"))
      return { Icon: LinkedinIcon, colors: CONTACT_COLORS.linkedin };
   if (t.includes("instagram"))
      return { Icon: InstagramIcon, colors: CONTACT_COLORS.instagram };
   if (t.includes("book") || t.includes("call"))
      return { Icon: Calendar, colors: CONTACT_COLORS.calendar };
   if (t.includes("github"))
      return { Icon: GitHubIcon, colors: CONTACT_COLORS.github };
   return { Icon: Mail, colors: CONTACT_COLORS.email };
};

export interface FormData {
   name: string;
   email: string;
   message: string;
}

export interface Status {
   type: string;
   message: string;
}
