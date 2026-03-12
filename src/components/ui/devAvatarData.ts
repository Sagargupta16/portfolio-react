import {
   Code2,
   Cloud,
   Terminal,
   Braces,
   Database,
   GitBranch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface OrbitItem {
   Icon: LucideIcon;
   color: string;
   delay: number;
   angle: number;
}

export const orbitItems: OrbitItem[] = [
   { Icon: Cloud, color: "#06b6d4", delay: 0, angle: 0 },
   { Icon: Terminal, color: "#22c55e", delay: 0.5, angle: 60 },
   { Icon: Braces, color: "#a855f7", delay: 1, angle: 120 },
   { Icon: Database, color: "#f59e0b", delay: 1.5, angle: 180 },
   { Icon: GitBranch, color: "#06b6d4", delay: 2, angle: 240 },
   { Icon: Code2, color: "#a855f7", delay: 2.5, angle: 300 },
];

export const floatVariant = (delay: number) => ({
   animate: {
      y: [-8, 8, -8],
      transition: {
         duration: 4,
         repeat: Infinity,
         ease: "easeInOut" as const,
         delay,
      },
   },
});
