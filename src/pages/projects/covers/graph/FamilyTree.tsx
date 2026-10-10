import { motion } from "motion/react";
import {
   CARD_FILL,
   CARD_H,
   CARD_RX,
   CARD_W,
   ELBOW,
   FUSE,
   HALF_H,
   HALF_W,
   RAIL_HALF,
   ROWS,
   VIEW_W,
   WHITE_22,
   WHITE_55,
   hairline,
} from "./kinfolkLayout";
import type { Family, Point } from "./kinfolkLayout";

/* Generation rails: ground, not figure. Row II, where the link lives, is
   the lit one. */
export const Rails = () => (
   <>
      {ROWS.map((y, i) => (
         <g key={y}>
            {/* Only the linked row gets a wash; full-width fills on every
                row read as stripes at card size. */}
            {i === 1 && (
               <rect
                  x={0}
                  y={y - RAIL_HALF}
                  width={VIEW_W}
                  height={RAIL_HALF * 2}
                  fill="rgba(255,255,255,0.018)"
               />
            )}
            <path
               d={`M0 ${y - RAIL_HALF} L${VIEW_W} ${y - RAIL_HALF}`}
               {...hairline("rgba(255,255,255,0.05)")}
            />
         </g>
      ))}
   </>
);

/* An index card: name line and date line, plus a wash on the copy of the
   shared human. Opaque, so the fused copies stack instead of mixing. */
const Person = ({
   at,
   stroke,
   wash,
}: {
   at: Point;
   stroke: string;
   wash?: string;
}) => {
   const box = {
      x: at[0] - HALF_W,
      y: at[1] - HALF_H,
      width: CARD_W,
      height: CARD_H,
      rx: CARD_RX,
   };
   return (
      <>
         <rect {...box} fill={CARD_FILL} />
         {wash && <rect {...box} fill={wash} />}
         <rect {...box} {...hairline(stroke)} />
         <rect
            x={box.x + 26}
            y={box.y + 33}
            width={124}
            height={13}
            rx={6.5}
            fill={WHITE_55}
         />
         <rect
            x={box.x + 26}
            y={box.y + 70}
            width={76}
            height={9}
            rx={4.5}
            fill={WHITE_22}
         />
      </>
   );
};

/* Marriage line at mid-card height, the union dot on it, a stem down to the
   sibling bar, and rounded elbows into each child: parentage hangs off the
   union, never off a parent pair. */
const Lineage = ({ family, stroke }: { family: Family; stroke: string }) => {
   const [[p1x, py], [p2x]] = family.partners;
   const [ux, uy] = family.union;
   const [[c1x, cy], [c2x]] = family.children;
   const top = cy - HALF_H;
   const bar = family.barY;
   const d = [
      `M${p1x + HALF_W} ${py} L${p2x - HALF_W} ${py}`,
      `M${ux} ${uy} L${ux} ${bar}`,
      `M${c1x} ${top} L${c1x} ${bar + ELBOW} Q${c1x} ${bar} ${c1x + ELBOW} ${bar}`,
      `L${c2x - ELBOW} ${bar} Q${c2x} ${bar} ${c2x} ${bar + ELBOW} L${c2x} ${top}`,
   ].join(" ");
   return (
      <>
         <path d={d} {...hairline(stroke)} />
         <circle cx={ux} cy={uy} r={13} fill={stroke} />
      </>
   );
};

interface TreeProps {
   family: Family;
   shared: Point;
   card: string;
   sharedCard: string;
   edge: string;
   wash: string;
   shiftX: number;
   shiftY: number;
}

/* One family's own record; the whole tree slides as a unit when fused and
   slides back unchanged when unlinked. */
export const Tree = ({
   family,
   shared,
   card,
   sharedCard,
   edge,
   wash,
   shiftX,
   shiftY,
}: TreeProps) => (
   <motion.g
      animate={{
         x: [0, 0, shiftX, shiftX, 0, 0],
         y: [0, 0, shiftY, shiftY, 0, 0],
      }}
      transition={FUSE}
   >
      <Lineage family={family} stroke={edge} />
      {[...family.partners, ...family.children].map((at) => {
         const isShared = at === shared;
         return (
            <Person
               key={at.join()}
               at={at}
               stroke={isShared ? sharedCard : card}
               wash={isShared ? wash : undefined}
            />
         );
      })}
   </motion.g>
);
