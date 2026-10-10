import type { ComponentType } from "react";
import { motion } from "motion/react";
import {
   AMBER,
   SOLID_FILL,
   W10,
   W18,
   W30,
   W50,
   cubicAt,
   cubicD,
   hair,
   loop,
   pin,
   rect,
   sCurve,
   windowKeys,
   windowTimes,
   type Leg,
} from "./docs/kit";
import { OkRing, Packet, Pop, SceneRoot, Text, Wires } from "./docs/primitives";

/*
 * ITR Agent: three documents stay on disk. Form 16, the AIS (its padlock
 * opens: decrypted on device) and the caret-delimited 26AS each send their
 * figures into the versioned rule pack; reconcile flags an amber mismatch on
 * the 26AS line as it lands. Income climbs the seven new-regime slabs
 * (compute_tax), then recommend_itr_form rules out ITR1, ITR3 and ITR4, lights
 * ITR2, and the filing checklist ends on the e-verify tick.
 *
 * Shares the Docs kit (docs/kit.ts, docs/primitives.tsx). Animated nodes
 * (12): AIS shackle, three input packets, mismatch, slab fill, verdict
 * packet, three strikes, ITR2 highlight, e-verify tick.
 */

const CYCLE = 5.6;
const HOLD = 0.86;

/* Documents, left. Tiles size to their label; wires start under them. */
const DOC_X = 13;
const WIRE_X = 20;

/* Rule pack engine, middle. */
const ENGINE = { x: 60, y: 10, w: 34, h: 76 };
const ENGINE_INSET = 8;
const ENGINE_RIGHT = ENGINE.x + ENGINE.w;
const SLABS = [0, 1, 2, 3, 4, 5, 6];
const FILL_FROM = 0.3;
const FILL_TO = 0.5;
const FILL_LEVEL = 0.62;

/* Form picker, right. */
const FORM_X = 104;
const CHIP_W = 56;
const CHIP_H = 18;
const ITR2_Y = 38;
const TICK = 14;

interface DocSpec {
   name: string;
   y: number;
   entry: number;
   glyph: "lines" | "lock" | "cells";
}

const DOCS: DocSpec[] = [
   { name: "FORM 16", y: 22, entry: 38, glyph: "lines" },
   { name: "AIS", y: 48, entry: 48, glyph: "lock" },
   { name: "26AS", y: 74, entry: 58, glyph: "cells" },
];
const INPUT_LEGS: Leg[] = DOCS.map((d, i) => ({
   curve: sCurve({ x: WIRE_X, y: d.y }, { x: ENGINE.x, y: d.entry }),
   from: 0.06 + i * 0.05,
   to: 0.24 + i * 0.05,
}));
const MISMATCH = cubicAt(INPUT_LEGS[2].curve, 0.82);
const MISMATCH_AT = INPUT_LEGS[2].to - 0.02;
const VERDICT_LEG: Leg = {
   curve: sCurve({ x: ENGINE_RIGHT, y: 48 }, { x: FORM_X, y: ITR2_Y }),
   from: FILL_TO + 0.02,
   to: FILL_TO + 0.12,
};

interface FormSpec {
   y: number;
   /** Strike beat for a ruled-out form; ITR2 has none. */
   strike?: number;
}

const FORMS: FormSpec[] = [
   { y: 20, strike: 0.6 },
   { y: ITR2_Y },
   { y: 56, strike: 0.63 },
   { y: 74, strike: 0.66 },
];
const STRUCK = FORMS.flatMap((f) =>
   f.strike === undefined ? [] : [{ y: f.y, at: f.strike }],
);
const PICK_AT = VERDICT_LEG.to;
const VERIFY_AT = PICK_AT + 0.08;

/* ---------- document glyphs ---------- */

const GLYPH_BOX = {
   width: 10,
   height: 12,
   position: "relative",
   flex: "none",
} as const;
const line = (w: number) => ({
   display: "block",
   width: w,
   height: 2,
   borderRadius: 1,
   background: W50,
});

/* Form 16: typed lines. */
const Lines = () => (
   <span
      style={{
         ...GLYPH_BOX,
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         gap: 2.5,
      }}
   >
      <span style={line(10)} />
      <span style={line(6)} />
      <span style={line(9)} />
   </span>
);

/* AIS: the shackle lifts as the file is decrypted on device. */
const Lock = () => (
   <span style={GLYPH_BOX}>
      <motion.span
         initial={{ y: 0 }}
         animate={{ y: windowKeys(0, -2.5) }}
         transition={loop(CYCLE, windowTimes(0.02, HOLD))}
         style={{
            position: "absolute",
            left: 2,
            top: 0,
            width: 6,
            height: 7,
            boxSizing: "border-box",
            borderRadius: "3px 3px 0 0",
            border: `1px solid ${W50}`,
            borderBottom: "none",
         }}
      />
      <span
         style={{
            position: "absolute",
            left: 0,
            top: 5,
            width: 10,
            height: 7,
            borderRadius: 1.5,
            background: W50,
         }}
      />
   </span>
);

/* 26AS: caret-delimited cells from the TRACES text export. */
const CELL_KEYS = ["a", "b", "c", "d", "e", "f"];
const Cells = () => (
   <span
      style={{
         ...GLYPH_BOX,
         display: "grid",
         gridTemplateColumns: "repeat(3, 2.5px)",
         alignContent: "center",
         gap: "3px 1.25px",
      }}
   >
      {CELL_KEYS.map((k) => (
         <span key={k} style={{ height: 2.5, background: W50 }} />
      ))}
   </span>
);

const GLYPHS: Record<DocSpec["glyph"], ComponentType> = {
   lines: Lines,
   lock: Lock,
   cells: Cells,
};

const DocTile = ({ doc }: { doc: DocSpec }) => {
   const Glyph = GLYPHS[doc.glyph];
   return (
      <div
         style={{
            ...pin(DOC_X, doc.y),
            marginTop: -11,
            height: 22,
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
            gap: 7,
            borderRadius: 8,
            border: `1px solid ${W18}`,
            background: SOLID_FILL,
         }}
      >
         <Glyph />
         <Text text={doc.name} color={W50} />
      </div>
   );
};

/* ---------- rule pack ---------- */

const Engine = ({ tint }: { tint: string }) => (
   <div
      style={{
         ...rect(ENGINE.x, ENGINE.y, ENGINE.w, ENGINE.h),
         borderRadius: 8,
         border: `1px solid ${tint}45`,
         background: `${tint}08`,
      }}
   >
      <motion.div
         initial={{ scaleY: 0 }}
         animate={{ scaleY: windowKeys(0, FILL_LEVEL) }}
         transition={loop(
            CYCLE,
            windowTimes(FILL_FROM, HOLD, FILL_TO - FILL_FROM, 0.08),
         )}
         style={{
            position: "absolute",
            inset: ENGINE_INSET,
            borderRadius: 3,
            background: `${tint}2e`,
            borderTop: `1px solid ${tint}cc`,
            transformOrigin: "50% 100%",
         }}
      />
      <div
         style={{
            position: "absolute",
            inset: ENGINE_INSET,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
         }}
      >
         {SLABS.map((slab) => (
            <span key={slab} style={{ height: 1, background: W10 }} />
         ))}
      </div>
   </div>
);

/* ---------- form picker ---------- */

const CHIP = {
   marginTop: -CHIP_H / 2,
   width: CHIP_W,
   height: CHIP_H,
   borderRadius: 6,
} as const;

const FormChip = ({ form }: { form: FormSpec }) => (
   <div
      style={{
         ...pin(FORM_X, form.y),
         ...CHIP,
         display: "grid",
         placeItems: "center",
         border: `1px solid ${W18}`,
         background: SOLID_FILL,
      }}
   >
      {form.strike === undefined ? (
         <Text text="ITR2" color={W50} />
      ) : (
         <span
            style={{ width: 22, height: 3, borderRadius: 1.5, background: W30 }}
         />
      )}
   </div>
);

const Strike = ({ y, at }: { y: number; at: number }) => (
   <motion.span
      initial={{ scaleX: 0 }}
      animate={{ scaleX: windowKeys(0, 1) }}
      transition={loop(CYCLE, windowTimes(at, HOLD))}
      style={{
         ...pin(FORM_X, y),
         marginLeft: 6,
         marginTop: -0.75,
         width: CHIP_W - 12,
         height: 1.5,
         background: W50,
         transformOrigin: "0 50%",
      }}
   />
);

const Picker = ({ tint }: { tint: string }) => (
   <>
      {FORMS.map((f) => (
         <FormChip key={f.y} form={f} />
      ))}
      {STRUCK.map((f) => (
         <Strike key={f.y} y={f.y} at={f.at} />
      ))}
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: windowKeys(0, 1) }}
         transition={loop(CYCLE, windowTimes(PICK_AT, HOLD))}
         style={{
            ...pin(FORM_X, ITR2_Y),
            ...CHIP,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${tint}`,
            background: `${tint}1a`,
         }}
      >
         <Text text="ITR2" color={tint} />
      </motion.div>
      <Pop
         x={FORM_X}
         y={ITR2_Y}
         cycle={CYCLE}
         on={VERIFY_AT}
         off={HOLD}
         size={TICK}
         style={{ marginLeft: CHIP_W + 8 }}
      >
         <OkRing size={TICK} />
      </Pop>
   </>
);

const TaxScene = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="70% 38%" lattice="grid">
      <Wires>
         {INPUT_LEGS.map((leg) => (
            <path key={leg.from} d={cubicD(leg.curve)} {...hair(W10)} />
         ))}
         <path d={cubicD(VERDICT_LEG.curve)} {...hair(W10)} />
      </Wires>
      {INPUT_LEGS.map((leg) => (
         <Packet key={leg.from} tint={tint} legs={[leg]} cycle={CYCLE} />
      ))}
      {DOCS.map((doc) => (
         <DocTile key={doc.name} doc={doc} />
      ))}
      <Engine tint={tint} />
      <Pop
         x={MISMATCH.x}
         y={MISMATCH.y}
         cycle={CYCLE}
         on={MISMATCH_AT}
         off={MISMATCH_AT + 0.12}
         size={7}
         style={{ borderRadius: "50%", background: AMBER }}
      />
      <Packet tint={tint} legs={[VERDICT_LEG]} cycle={CYCLE} />
      <Picker tint={tint} />
   </SceneRoot>
);

export default TaxScene;
