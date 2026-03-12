import type { ComponentType } from "react";
import type { OpenSourceContribution } from "@/types";
import { MONO_FONT } from "@/constants/theme";
import ContribCard from "./ContribCard";

interface ContribSectionProps {
   icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
   label: string;
   count: number;
   color: string;
   items: OpenSourceContribution[];
}

const ContribSection = ({
   icon: Icon,
   label,
   count,
   color,
   items,
}: ContribSectionProps) => (
   <>
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
         }}
      >
         <Icon size={14} style={{ color }} />
         <span
            style={{
               fontSize: 12,
               fontWeight: 700,
               color,
               fontFamily: MONO_FONT,
               letterSpacing: "0.03em",
            }}
         >
            {label} ({count})
         </span>
      </div>
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 10,
         }}
      >
         {items.map((contrib) => (
            <ContribCard key={contrib.url} contrib={contrib} />
         ))}
      </div>
   </>
);

export default ContribSection;
