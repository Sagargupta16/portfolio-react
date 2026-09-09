import { createContext } from "react";
import type { ContentSectionId } from "@/constants/sections";

interface SectionNavigationValue {
   loadThrough: number;
   markSectionReady: (id: ContentSectionId) => void;
   navigateToSection: (id: string) => void;
}

export const SectionNavigationContext =
   createContext<SectionNavigationValue | null>(null);
