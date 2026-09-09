import type { ComponentType } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * ITR Agent: local documents (Form 16, an encrypted AIS, a caret-delimited
 * 26AS) feed a rule-pack engine. Income climbs the seven-rung slab ladder, a
 * reconcile mismatch flashes amber where the 26AS wire lands, then one dot
 * exits to the form column where three ITR forms get ruled out, the
 * recommended one lights, and the e-verify tick lands beside it.
 *
 * Single-variant family for now: a future rules/ledger repo would swap the
 * input glyphs and the output column and become its second variant.
 *
 * Wires and travelling dots live in one SVG (viewBox 100 x 62 stretched to
 * the 16:10 slot) so 1 unit is 1% of the width and ~1% of the height, and
 * every route lands on a percent-positioned panel edge at any card width.
 */

const CYCLE = 5.4;
const STAGGER = 0.028; // 0.15 s of the cycle

const BASE_DARK = "#0b1012";
const WHITE_03 = "rgba(255,255,255,0.03)";
const WHITE_12 = "rgba(255,255,255,0.12)";
const WHITE_25 = "rgba(255,255,255,0.25)";
const WHITE_35 = "rgba(255,255,255,0.35)";
const WHITE_55 = "rgba(255,255,255,0.55)";
const HAIRLINE = "rgba(255,255,255,0.10)";
/* The standard 3% lift, but opaque, so a wire tail can hide under a card. */
const CARD_FILL = `linear-gradient(${WHITE_03}, ${WHITE_03}), ${BASE_DARK}`;
const OK_GREEN = "#22c55e";
const WARN_AMBER = "#f59e0b";

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
};

/* Every loop shares the cycle; beats sit on `times`. One ease per segment
 * keeps WAAPI-run opacity on the same per-keyframe curve as the transforms. */
const loop = (times: number[]) => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: Array.from({ length: times.length - 1 }, () => "easeInOut" as const),
});

/* Box whose vertical centre sits on `center`% of the slot at any width. */
const anchored = (
   left: string,
   center: number,
   width: number,
   height: number,
): React.CSSProperties => ({
   position: "absolute",
   left,
   top: `${center}%`,
   marginTop: -height / 2,
   width,
   height,
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
});

/* Percent-of-slot geometry shared by the SVG wires and the HTML panels. */
const PANEL = { left: 36, top: 22, width: 28, height: 56 };
const PANEL_RIGHT = PANEL.left + PANEL.width;
const CHIP_LEFT = 70;
const CHIP_WIDTH = 44; // px; clears the slot edge at 165 px wide
const WIRE_TAIL_X = 14; // under the doc card at any grid width up to ~660 px
const EXIT_Y = 31; // panel mid-height, in viewBox units
const MISMATCH_X = 31; // where the amber finding pops on the 26AS wire
const RECOMMENDED_CENTER = 38;

interface FormSpec {
   name: string;
   center: number; // % of slot height
   struck?: number; // strike order for ruled-out forms
}

const FORMS: FormSpec[] = [
   { name: "ITR1", center: 18, struck: 0 },
   { name: "ITR2", center: RECOMMENDED_CENTER },
   { name: "ITR3", center: 58, struck: 1 },
   { name: "ITR4", center: 78, struck: 2 },
];

/* % of slot height -> viewBox y units. */
const toUnits = (pct: number) => pct * 0.62;

const WIRE = {
   stroke: HAIRLINE,
   strokeWidth: 1,
   fill: "none",
   vectorEffect: "non-scaling-stroke",
} as const;

/* -- left: the three documents on disk -- */

const FORM_LINE_WIDTHS = ["70%", "50%", "62%"];
const CELL_COLS = [0, 1, 2, 3];
const CELL_ROWS = [0, 1];
const bar: React.CSSProperties = { display: "block", background: WHITE_25 };

/* Form 16: three typed rows. */
const FormLines = () => (
   <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
      {FORM_LINE_WIDTHS.map((w) => (
         <span
            key={w}
            style={{ ...bar, width: w, height: 2, borderRadius: 1 }}
         />
      ))}
   </div>
);

/* AIS: decrypted on device, so a padlock. */
const LockGlyph = () => (
   <div style={{ position: "relative", width: 8, height: 9 }}>
      <span
         style={{
            position: "absolute",
            left: 1.5,
            top: 0,
            width: 5,
            height: 5,
            borderRadius: "3px 3px 0 0",
            border: `1px solid ${WHITE_35}`,
            borderBottom: "none",
         }}
      />
      <span
         style={{
            position: "absolute",
            left: 0,
            top: 4,
            width: 8,
            height: 5,
            borderRadius: 1,
            background: WHITE_35,
         }}
      />
   </div>
);

/* 26AS: caret-delimited cells from the TRACES export. */
const CaretCells = () => (
   <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {CELL_ROWS.map((row) => (
         <div key={row} style={{ display: "flex", gap: 2 }}>
            {CELL_COLS.map((col) => (
               <span key={col} style={{ ...bar, width: 5, height: 2 }} />
            ))}
         </div>
      ))}
   </div>
);

interface DocSpec {
   id: string;
   center: number; // % of slot height
   entryY: number; // where its wire meets the panel edge, viewBox units
   Glyph: ComponentType;
}

const DOCS: DocSpec[] = [
   { id: "form16", center: 21, entryY: 28, Glyph: FormLines },
   { id: "ais", center: 48, entryY: 31, Glyph: LockGlyph },
   { id: "26as", center: 75, entryY: 34, Glyph: CaretCells },
];

const DocCard = ({ doc }: { doc: DocSpec }) => (
   <div
      style={{
         ...anchored("8%", doc.center, 40, 26),
         padding: "0 6px",
         borderRadius: 5,
         border: `1px solid ${WHITE_12}`,
         background: CARD_FILL,
      }}
   >
      <doc.Glyph />
   </div>
);

/* -- wires and the dots that ride them -- */

const InputDot = ({
   tint,
   doc,
   index,
}: {
   tint: string;
   doc: DocSpec;
   index: number;
}) => {
   const y0 = toUnits(doc.center);
   const dx = PANEL.left - WIRE_TAIL_X;
   const dy = doc.entryY - y0;
   const t = index * STAGGER;
   return (
      <motion.circle
         cx={WIRE_TAIL_X}
         cy={y0}
         r={1.2}
         fill={tint}
         initial={{ opacity: 0 }}
         animate={{
            x: [0, 0, dx, dx, 0],
            y: [0, 0, dy, dy, 0],
            opacity: [0, 1, 1, 0, 0],
         }}
         transition={loop([t, t + 0.03, t + 0.2, t + 0.25, 1])}
      />
   );
};

/* One reconcile finding, where the 26AS wire meets the engine. */
const MismatchDot = () => {
   const doc = DOCS[2];
   const y0 = toUnits(doc.center);
   const along = (MISMATCH_X - WIRE_TAIL_X) / (PANEL.left - WIRE_TAIL_X);
   const cy = y0 + along * (doc.entryY - y0);
   return (
      <motion.circle
         cx={MISMATCH_X}
         cy={cy}
         r={1.3}
         fill={WARN_AMBER}
         initial={{ opacity: 0, scale: 0.4 }}
         animate={{
            scale: [0.4, 1.3, 1, 0.4, 0.4],
            opacity: [0, 1, 1, 0, 0],
         }}
         transition={loop([0.3, 0.36, 0.48, 0.52, 1])}
      />
   );
};

/* The verdict leaving the engine for the form column. */
const TransitDot = ({ tint }: { tint: string }) => {
   const dx = CHIP_LEFT - PANEL_RIGHT;
   return (
      <motion.circle
         cx={PANEL_RIGHT}
         cy={EXIT_Y}
         r={1.2}
         fill={tint}
         initial={{ opacity: 0 }}
         animate={{ x: [0, 0, dx, dx, 0], opacity: [0, 1, 1, 0, 0] }}
         transition={loop([0.41, 0.42, 0.52, 0.55, 1])}
      />
   );
};

const Wiring = ({ tint }: { tint: string }) => (
   <svg
      viewBox="0 0 100 62"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
   >
      {DOCS.map((doc, i) => (
         <g key={doc.id}>
            <path
               d={`M${WIRE_TAIL_X},${toUnits(doc.center)} L${PANEL.left},${doc.entryY}`}
               {...WIRE}
            />
            <InputDot tint={tint} doc={doc} index={i} />
         </g>
      ))}
      <path d={`M${PANEL_RIGHT},${EXIT_Y} L${CHIP_LEFT},${EXIT_Y}`} {...WIRE} />
      <path
         d={`M${CHIP_LEFT},${toUnits(FORMS[0].center)} L${CHIP_LEFT},${toUnits(FORMS[3].center)}`}
         {...WIRE}
      />
      <MismatchDot />
      <TransitDot tint={tint} />
   </svg>
);

/* -- middle: the rule pack, seven slab rungs and the income fill -- */

const SLABS = [0, 1, 2, 3, 4, 5, 6];
const ladder: React.CSSProperties = { position: "absolute", inset: 7 };

const RulePanel = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: `${PANEL.left}%`,
         top: `${PANEL.top}%`,
         width: `${PANEL.width}%`,
         height: `${PANEL.height}%`,
         borderRadius: 8,
         border: `1px solid ${tint}45`,
         background: `${tint}08`,
      }}
   >
      <motion.div
         initial={{ scaleY: 0 }}
         animate={{ scaleY: [0, 0.62, 0.62, 0] }}
         transition={loop([0.17, 0.41, 0.85, 1])}
         style={{
            ...ladder,
            borderRadius: 2,
            background: `${tint}2e`,
            borderTop: `1px solid ${tint}cc`,
            transformOrigin: "bottom",
         }}
      />
      <div
         style={{
            ...ladder,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
         }}
      >
         {SLABS.map((slab) => (
            <span
               key={slab}
               style={{ display: "block", height: 1, background: WHITE_12 }}
            />
         ))}
      </div>
   </div>
);

/* -- right: the four forms, three ruled out, one recommended -- */

const Strike = ({ order }: { order: number }) => {
   const t = 0.52 + order * STAGGER;
   return (
      <motion.span
         initial={{ scaleX: 0 }}
         animate={{ scaleX: [0, 1, 1, 0] }}
         transition={loop([t, t + 0.06, 0.85, 1])}
         style={{
            position: "absolute",
            left: 5,
            right: 5,
            top: "50%",
            height: 1,
            background: "rgba(255,255,255,0.5)",
            transformOrigin: "left",
         }}
      />
   );
};

/* Last checklist step: e-verify. Sits just right of its chip. */
const VerifyCheck = () => (
   <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 0.5] }}
      transition={loop([0, 0.67, 0.74, 0.92, 1])}
      style={{
         ...anchored("calc(100% + 6px)", 50, 12, 12),
         borderRadius: "50%",
         border: `1px solid ${OK_GREEN}50`,
         background: `${OK_GREEN}10`,
      }}
   >
      <div
         style={{
            position: "absolute",
            left: 3,
            top: 3,
            width: 5,
            height: 3,
            borderLeft: `1.5px solid ${OK_GREEN}`,
            borderBottom: `1.5px solid ${OK_GREEN}`,
            transform: "rotate(-45deg)",
         }}
      />
   </motion.div>
);

/* The recommended form lights up, then the e-verify tick lands beside it. */
const Recommend = ({ tint }: { tint: string }) => (
   <>
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 1, 1, 0] }}
         transition={loop([0.6, 0.66, 0.85, 1])}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 4,
            border: `1px solid ${tint}`,
            background: `${tint}14`,
         }}
      />
      <VerifyCheck />
   </>
);

const FormChip = ({ tint, form }: { tint: string; form: FormSpec }) => (
   <div
      style={{
         ...anchored(`${CHIP_LEFT}%`, form.center, CHIP_WIDTH, 16),
         borderRadius: 4,
         border: `1px solid ${WHITE_12}`,
         background: WHITE_03,
      }}
   >
      <span style={{ ...label, color: WHITE_55 }}>{form.name}</span>
      {form.struck === undefined ? (
         <Recommend tint={tint} />
      ) : (
         <Strike order={form.struck} />
      )}
   </div>
);

const TaxScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: `linear-gradient(160deg, #0e1a24 0%, ${BASE_DARK} 60%)`,
      }}
   >
      {/* faint glow on the engine */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, ${tint}14 0%, transparent 55%)`,
         }}
      />
      <Wiring tint={tint} />
      {DOCS.map((doc) => (
         <DocCard key={doc.id} doc={doc} />
      ))}
      <RulePanel tint={tint} />
      {FORMS.map((form) => (
         <FormChip key={form.name} tint={tint} form={form} />
      ))}
   </div>
);

export default TaxScene;
