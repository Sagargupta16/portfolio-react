import { MONO_FONT } from "@/constants/theme";

interface TechTagProps {
   label: string;
   accent?: string;
   size?: number;
}

const TechTag = ({ label, accent = "#06b6d4", size = 11 }: TechTagProps) => (
   <span
      style={{
         fontFamily: MONO_FONT,
         fontSize: size,
         padding: "3px 10px",
         borderRadius: 6,
         background: `${accent}10`,
         color: accent,
         border: `1px solid ${accent}20`,
      }}
   >
      {label}
   </span>
);

export default TechTag;
