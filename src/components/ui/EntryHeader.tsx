import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { SKY, TEXT_PRIMARY } from "@/constants/theme";
import { getOrgLogo } from "@utils/orgLogos";
import { ENTRY_INDENT, ENTRY_TEXT, LOGO_GAP, LOGO_TILE } from "./entryStyles";

// The flat dark tile of the floating stack tiles: one fill step above the
// card and a hairline edge, the mark in its own colours. Marks that need a
// light field carry it themselves (the NITW shield, the DAVV and Kids Garden
// seals); a lockup too wide or dark for the tile has a tile cut of its own
// (src/assets/logos/README.md).
const LOGO_SIZE = 30;
const LOGO_MAX_WIDTH = LOGO_TILE - 8;

const TILE: CSSProperties = {
   width: LOGO_TILE,
   height: LOGO_TILE,
   borderRadius: 12,
   background: "rgb(var(--ch-white) / 0.04)",
   border: "1px solid rgb(var(--ch-white) / 0.08)",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   flexShrink: 0,
};
const META: CSSProperties = {
   fontSize: 11,
   padding: "2px 8px",
   whiteSpace: "nowrap",
};

/** The small label at the end of the name row: employment type, CGPA. */
export const EntryMeta = ({ children }: { children: ReactNode }) => (
   <span className="tag tag-purple" style={META}>
      {children}
   </span>
);

interface EntryHeaderProps {
   /** Company, body or school; also picks the logo. */
   org: string;
   /** Role or degree. */
   title: string;
   /** An EntryMeta: right of the name on desktop, under the title on phones. */
   meta?: ReactNode;
   /** Supporting lines under the title (a summary, a department, a board). */
   lines?: string[];
   /** Shown in the tile when the org has no registered logo. */
   fallbackIcon: LucideIcon;
   isMobile: boolean;
}

/**
 * Logo, name, title and supporting lines: the head of every timeline card,
 * on the project cards' type scale (20px title, 14px summary).
 */
const EntryHeader = ({
   org,
   title,
   meta,
   lines = [],
   fallbackIcon: Fallback,
   isMobile,
}: Readonly<EntryHeaderProps>) => {
   const indent = isMobile ? 0 : ENTRY_INDENT;

   return (
      <>
         <div style={{ display: "flex", alignItems: "center", gap: LOGO_GAP }}>
            <div style={TILE}>
               {getOrgLogo(org, LOGO_SIZE, LOGO_MAX_WIDTH) ?? (
                  <Fallback size={20} color={SKY} aria-hidden="true" />
               )}
            </div>
            <h3
               style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: TEXT_PRIMARY,
               }}
            >
               {org}
            </h3>
            {!isMobile && meta}
         </div>

         {/* Phones: the label follows the title and drops to its own row when
             both do not fit, so the title never breaks early to make room
             (an inline label pulls the title's last word down with it). */}
         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               alignItems: "center",
               columnGap: 8,
               rowGap: 6,
               marginTop: isMobile ? 10 : 4,
               marginLeft: indent,
            }}
         >
            <p
               style={{
                  color: SKY,
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: 1.45,
               }}
            >
               {title}
            </p>
            {isMobile && meta}
         </div>

         {lines.map((line) => (
            <p
               key={line}
               style={{ ...ENTRY_TEXT, marginTop: 8, marginLeft: indent }}
            >
               {line}
            </p>
         ))}
      </>
   );
};

export default EntryHeader;
