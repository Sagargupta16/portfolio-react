import type { CSSProperties, ReactNode } from "react";
import type { Easing, Transition } from "motion/react";
import { motion } from "motion/react";
import { GREEN, MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * Claude Skills plugin marketplace -- install-and-unpack, not copy-and-sync.
 * marketplace.json registry row -> /plugin install -> plugins/<name>/ unpacks
 * into SKILL.md + commands + agents + hooks -> validate-plugins.sh PASSED.
 * One 5.4 s loop; every keyframe array ends at its start value. Transforms
 * reset between T_GONE and the wrap, while the element is fully transparent.
 */
const CYCLE = 5.4;
const at = (seconds: number): number => seconds / CYCLE;

const T_SELECT = at(0.8); // registry row brightens, /PLUGIN chip is in
const T_ARRIVE = at(1.8); // travelling dot reaches the plugin tile
const T_UNPACK = 1.8; // seconds; component chips start popping in
const T_PASSED = at(3.0); // validator ring scales in
const T_FADE = at(4.2); // everything installed fades, highlight dims
const T_GONE = at(5.0); // installed elements are transparent; transforms reset

/** Times for an element shown at `shown`, faded out by T_GONE, then resting. */
const fadeTimes = (...shown: number[]) => [0, ...shown, T_FADE, T_GONE, 1];

const WHITE_BORDER = "1px solid rgba(255,255,255,0.10)";
const WHITE_HAIRLINE = "1px solid rgba(255,255,255,0.06)";
const WHITE_FILL = "rgba(255,255,255,0.03)";
const WHITE_DIM = "rgba(255,255,255,0.35)";
const WHITE_BAR = "rgba(255,255,255,0.14)";
const WHITE_GLYPH = "rgba(255,255,255,0.5)";
const WHITE_TEXT = "rgba(255,255,255,0.7)";

/*
 * Motion runs opacity through WAAPI, where a single ease string stretches over
 * the whole iteration and drags keyframes off their `times`; one ease per
 * segment keeps the WAAPI and JS tracks on the same storyboard clock.
 */
const loop = (times: number[], ease: Easing = "easeInOut"): Transition => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.8,
   textTransform: "uppercase",
   lineHeight: 1,
   whiteSpace: "nowrap",
};

const fill: CSSProperties = { position: "absolute", inset: 0 };
const row: CSSProperties = { display: "flex", alignItems: "center" };
const panel: CSSProperties = {
   position: "absolute",
   border: WHITE_BORDER,
   background: WHITE_FILL,
};

interface DotProps {
   size: number;
   color: string;
   style?: CSSProperties;
}

const Dot = ({ size, color, style }: DotProps) => (
   <span
      style={{
         ...style,
         width: size,
         height: size,
         borderRadius: "50%",
         background: color,
         flexShrink: 0,
      }}
   />
);

const Bar = ({ width, color }: { width: number | string; color: string }) => (
   <span style={{ width, height: 2, borderRadius: 2, background: color }} />
);

interface RegistryRowSpec {
   width: string;
   highlighted?: boolean;
}

const REGISTRY_ROWS: RegistryRowSpec[] = [
   { width: "62%" },
   { width: "48%" },
   { width: "70%", highlighted: true },
   { width: "40%" },
   { width: "58%" },
   { width: "66%" },
   { width: "44%" },
];

const RegistryRow = ({
   width,
   highlighted = false,
   tint,
}: RegistryRowSpec & { tint: string }) => (
   <div
      style={{
         ...row,
         position: "relative",
         isolation: "isolate",
         height: 12,
         gap: 5,
         padding: "0 4px",
      }}
   >
      {highlighted && (
         <motion.div
            animate={{ opacity: [0.3, 1, 1, 0.3, 0.3] }}
            transition={loop(fadeTimes(T_SELECT))}
            style={{
               ...fill,
               zIndex: -1,
               borderRadius: 3,
               background: `${tint}26`,
               opacity: 0.3,
            }}
         />
      )}
      <Dot size={3} color={highlighted ? tint : `${tint}55`} />
      <Bar width={width} color={highlighted ? WHITE_DIM : WHITE_BAR} />
   </div>
);

/** marketplace.json -- the registry every install resolves through. */
const RegistryPanel = ({ tint }: { tint: string }) => (
   <div
      style={{
         ...panel,
         left: "8%",
         top: "16%",
         width: 92,
         height: 150,
         borderRadius: 6,
         overflow: "hidden",
      }}
   >
      <div
         style={{
            ...row,
            height: 14,
            padding: "0 7px",
            borderBottom: WHITE_HAIRLINE,
            background: WHITE_FILL,
         }}
      >
         <span style={{ ...label, color: "rgba(255,255,255,0.45)" }}>
            MARKETPLACE
         </span>
      </div>
      <div
         style={{
            padding: "10px 7px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
         }}
      >
         {REGISTRY_ROWS.map((spec) => (
            <RegistryRow key={spec.width} {...spec} tint={tint} />
         ))}
      </div>
   </div>
);

/** `/plugin install <name>@sagar-dev-skills` -- the command that moves the dot. */
const InstallChip = ({ tint }: { tint: string }) => (
   <motion.div
      animate={{ opacity: [0, 1, 1, 0, 0], y: [3, 0, 0, 0, 3] }}
      transition={loop(fadeTimes(T_SELECT))}
      style={{
         ...label,
         ...row,
         position: "absolute",
         left: "42%",
         top: "30%",
         height: 16,
         padding: "0 8px",
         borderRadius: 999,
         border: `1px solid ${tint}55`,
         background: `${tint}14`,
         color: WHITE_TEXT,
         opacity: 0,
      }}
   >
      /PLUGIN
   </motion.div>
);

/**
 * Hairline from the registry edge (8% + 92 px) to the tile edge (60%) plus one
 * travelling dot. The dot sits at the right end of a hairline-wide wrapper that
 * slides from x -100% to 0%, so it lands on the tile edge at any card width.
 */
const Connector = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "calc(8% + 92px)",
         top: "45%",
         width: "calc(52% - 92px)",
         height: 1,
         background: "rgba(255,255,255,0.12)",
      }}
   >
      <motion.div
         animate={{
            x: ["-100%", "-100%", "-85%", "-15%", "0%", "0%", "-100%"],
            opacity: [0, 0, 1, 1, 0, 0, 0],
         }}
         transition={loop(
            [
               0,
               T_SELECT,
               T_SELECT + at(0.15),
               T_ARRIVE - at(0.15),
               T_ARRIVE,
               T_GONE,
               1,
            ],
            "linear",
         )}
         style={{ ...fill, opacity: 0 }}
      >
         <Dot
            size={4}
            color={tint}
            style={{ position: "absolute", right: 0, top: -1.5 }}
         />
      </motion.div>
   </div>
);

/** commands/*.md -- slash-prefixed pill. */
const CommandGlyph = () => (
   <div style={{ ...row, gap: 3 }}>
      <span
         style={{
            width: 1,
            height: 8,
            background: WHITE_GLYPH,
            transform: "rotate(20deg)",
         }}
      />
      <span
         style={{
            width: 14,
            height: 6,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.28)",
         }}
      />
   </div>
);

/** agents/*.md -- one disc, one name bar. */
const AgentGlyph = () => (
   <div style={{ ...row, gap: 3 }}>
      <Dot size={5} color={WHITE_GLYPH} />
      <Bar width={10} color={WHITE_BAR} />
   </div>
);

/** hooks/*.sh -- shell prompt chevron and caret bar. */
const HookGlyph = () => (
   <div style={{ ...row, alignItems: "flex-end", gap: 3 }}>
      <span
         style={{
            width: 5,
            height: 5,
            marginBottom: 1,
            borderTop: `1.5px solid ${WHITE_GLYPH}`,
            borderRight: `1.5px solid ${WHITE_GLYPH}`,
            transform: "rotate(45deg)",
         }}
      />
      <Bar width={6} color={WHITE_DIM} />
   </div>
);

/** Pop-in timing for the i-th unpacked component (stagger 0.15 s). */
const popTimes = (index: number): number[] => {
   const start = at(T_UNPACK + index * 0.15);
   return fadeTimes(start, start + at(0.2), start + at(0.3));
};

interface ChipProps {
   index: number;
   children: ReactNode;
}

const ComponentChip = ({ index, children }: ChipProps) => (
   <motion.div
      animate={{
         opacity: [0, 0, 1, 1, 1, 0, 0],
         scale: [0.6, 0.6, 1.06, 1, 1, 1, 0.6],
      }}
      transition={loop(popTimes(index))}
      style={{
         ...row,
         justifyContent: "center",
         height: 22,
         borderRadius: 4,
         border: WHITE_BORDER,
         background: WHITE_FILL,
         opacity: 0,
      }}
   >
      {children}
   </motion.div>
);

/** validate-plugins.sh verdict -- full-green ring and tick, the brightest green here. */
const PassedBadge = () => (
   <div style={{ ...row, position: "absolute", right: 8, bottom: 8, gap: 5 }}>
      <motion.span
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(fadeTimes(T_PASSED + at(0.15), T_PASSED + at(0.45)))}
         style={{ ...label, color: WHITE_DIM, opacity: 0 }}
      >
         PASSED
      </motion.span>
      <motion.div
         animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0.5, 0.5, 1, 1, 1, 0.5],
         }}
         transition={loop(fadeTimes(T_PASSED, T_PASSED + at(0.35)))}
         style={{
            position: "relative",
            width: 13,
            height: 13,
            borderRadius: "50%",
            border: `1px solid ${GREEN}`,
            background: `${GREEN}10`,
            opacity: 0,
         }}
      >
         <div
            style={{
               position: "absolute",
               left: 3,
               top: 3.5,
               width: 5,
               height: 3,
               borderLeft: `1.5px solid ${GREEN}`,
               borderBottom: `1.5px solid ${GREEN}`,
               transform: "rotate(-45deg)",
            }}
         />
      </motion.div>
   </div>
);

/** plugins/<name>/ -- the tile the install unpacks into. */
const PluginTile = ({ tint }: { tint: string }) => (
   <div
      style={{
         ...panel,
         left: "60%",
         top: "22%",
         width: 104,
         height: 116,
         borderRadius: 8,
      }}
   >
      <motion.div
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(fadeTimes(T_ARRIVE, T_ARRIVE + at(0.2)))}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 8,
            border: `1px solid ${tint}55`,
            opacity: 0,
         }}
      />
      <div
         style={{
            ...row,
            height: 12,
            gap: 4,
            padding: "0 7px",
            borderBottom: WHITE_HAIRLINE,
         }}
      >
         <Dot size={3} color={`${tint}88`} />
         <Bar width={16} color={WHITE_BAR} />
      </div>
      <div
         style={{
            position: "absolute",
            left: 7,
            top: 24,
            width: 90,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 6,
         }}
      >
         <ComponentChip index={0}>
            <span style={{ ...label, color: WHITE_TEXT }}>SKILL.MD</span>
         </ComponentChip>
         <ComponentChip index={1}>
            <CommandGlyph />
         </ComponentChip>
         <ComponentChip index={2}>
            <AgentGlyph />
         </ComponentChip>
         <ComponentChip index={3}>
            <HookGlyph />
         </ComponentChip>
      </div>
      <PassedBadge />
   </div>
);

/** Claude Skills marketplace: registry row -> /plugin -> unpacked tile -> PASSED. */
const PluginScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         ...fill,
         overflow: "hidden",
         background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
      }}
   >
      <div
         style={{
            ...fill,
            background: `radial-gradient(circle at 72% 48%, ${tint}14 0%, transparent 55%)`,
         }}
      />
      <div
         style={{
            ...fill,
            opacity: 0.05,
            backgroundImage:
               "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
         }}
      />

      <RegistryPanel tint={tint} />
      <InstallChip tint={tint} />
      <Connector tint={tint} />
      <PluginTile tint={tint} />
   </div>
);

export default PluginScene;
