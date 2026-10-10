import { useId, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
   Activity,
   FolderInput,
   Layers,
   RefreshCw,
   Server,
   ShieldCheck,
   UserCheck,
   Workflow,
   type LucideIcon,
} from "lucide-react";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   MONO_FONT,
   TEXT_MUTED,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import type { ProjectDemoProps } from "./demoRegistry";

// Every label comes from project 49 in data/projects.json (description,
// features, tools_tech). Order is the pipeline order; the last node loops
// back to training.
interface PipelineNode {
   id: string;
   icon: LucideIcon;
   title: string;
   detail: string[];
}

const NODES: PipelineNode[] = [
   {
      id: "ingest",
      icon: FolderInput,
      title: "Ingestion",
      detail: ["event-driven"],
   },
   {
      id: "train",
      icon: Workflow,
      title: "Training",
      detail: ["3 architectures", "in parallel"],
   },
   {
      id: "ensemble",
      icon: Layers,
      title: "Ensemble",
      detail: ["transfer learning"],
   },
   {
      id: "gate",
      icon: ShieldCheck,
      title: "Quality gate",
      detail: ["accuracy >= 0.85", "recall >= 0.95"],
   },
   {
      id: "registry",
      icon: UserCheck,
      title: "Registry",
      detail: ["human approval"],
   },
   {
      id: "endpoint",
      icon: Server,
      title: "Endpoint",
      detail: ["Terraform-owned"],
   },
   {
      id: "drift",
      icon: Activity,
      title: "Drift monitor",
      detail: ["hourly PSI"],
   },
   {
      id: "retrain",
      icon: RefreshCw,
      title: "EventBridge",
      detail: ["restarts training"],
   },
];

const LOOP_TARGET = 1; // the retrain loop re-enters at Training

interface Box {
   x: number;
   y: number;
   w: number;
   h: number;
}

interface Layout {
   width: number;
   height: number;
   boxes: Box[];
   loopPath: string;
   compact: boolean;
}

// Desktop: two rows of four, serpentine (left to right, then right to left).
const DESKTOP_LAYOUT = ((): Layout => {
   const w = 136;
   const h = 66;
   const cols = [0, 168, 336, 504];
   const rows = [8, 130];
   const slots: [number, number][] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 1],
      [2, 1],
      [1, 1],
      [0, 1],
   ];
   const boxes = slots.map(([c, r]) => ({ x: cols[c], y: rows[r], w, h }));
   const from = boxes[NODES.length - 1];
   const to = boxes[LOOP_TARGET];
   const fx = from.x + w / 2;
   const tx = to.x + w / 2;
   const midY = (rows[0] + h + rows[1]) / 2;
   const r = 8;
   const loopPath = [
      `M ${fx} ${from.y}`,
      `V ${midY + r}`,
      `Q ${fx} ${midY} ${fx + r} ${midY}`,
      `H ${tx - r}`,
      `Q ${tx} ${midY} ${tx} ${midY - r}`,
      `V ${to.y + h}`,
   ].join(" ");
   return {
      width: 640,
      height: rows[1] + h + 8,
      boxes,
      loopPath,
      compact: false,
   };
})();

// Phone: one column, the loop runs up the right-hand gutter.
const PHONE_LAYOUT = ((): Layout => {
   const x = 4;
   const w = 248;
   const h = 46;
   const gap = 20;
   const boxes = NODES.map((_, i) => ({ x, y: 4 + i * (h + gap), w, h }));
   const from = boxes[NODES.length - 1];
   const to = boxes[LOOP_TARGET];
   const right = x + w;
   const lane = right + 32;
   const fy = from.y + h / 2;
   const ty = to.y + h / 2;
   const r = 8;
   const loopPath = [
      `M ${right} ${fy}`,
      `H ${lane - r}`,
      `Q ${lane} ${fy} ${lane} ${fy - r}`,
      `V ${ty + r}`,
      `Q ${lane} ${ty} ${lane - r} ${ty}`,
      `H ${right}`,
   ].join(" ");
   return {
      width: 300,
      height: from.y + h + 4,
      boxes,
      loopPath,
      compact: true,
   };
})();

/** Straight connector between two neighbouring boxes (same row or column). */
const edgePath = (a: Box, b: Box): string => {
   if (a.y === b.y) {
      const cy = a.y + a.h / 2;
      return b.x > a.x
         ? `M ${a.x + a.w} ${cy} H ${b.x}`
         : `M ${a.x} ${cy} H ${b.x + b.w}`;
   }
   const cx = a.x + a.w / 2;
   return b.y > a.y
      ? `M ${cx} ${a.y + a.h} V ${b.y}`
      : `M ${cx} ${a.y} V ${b.y + b.h}`;
};

// Beam timing: one edge at a time, then a short rest before the loop repeats.
const STEP = 0.7;
const REST = 0.8;
const EDGE_COUNT = NODES.length; // seven forward edges plus the loop
const CYCLE = EDGE_COUNT * STEP + REST;
const BEAM = 0.16;
const BEAM_GAP = 1.2;

const ARIA_SUMMARY =
   "Pipeline: event-driven ingestion, training of three architectures in parallel, ensemble, quality gate (accuracy at least 0.85, recall at least 0.95), model registry with human approval, endpoint, hourly PSI drift monitor, and EventBridge restarting training.";

const PipelineBeams = ({ accent, isMobile }: ProjectDemoProps) => {
   const { reducedMotion } = useMotionPreference();
   const frameRef = useRef<HTMLDivElement>(null);
   const inView = useInView(frameRef, { amount: 0.3 });
   const markerId = `pipeline-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
   const layout = isMobile ? PHONE_LAYOUT : DESKTOP_LAYOUT;
   const animate = inView && !reducedMotion;

   const edges = [
      ...layout.boxes.slice(0, -1).map((box, i) => ({
         id: `${NODES[i].id}-${NODES[i + 1].id}`,
         d: edgePath(box, layout.boxes[i + 1]),
         loop: false,
      })),
      { id: "retrain-loop", d: layout.loopPath, loop: true },
   ];

   return (
      <div
         ref={frameRef}
         style={{
            padding: isMobile ? "14px 10px" : "18px 16px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
         }}
      >
         <svg
            viewBox={`-4 0 ${layout.width + 8} ${layout.height}`}
            role="img"
            aria-label={ARIA_SUMMARY}
            style={{
               display: "block",
               width: "100%",
               height: "auto",
               maxWidth: isMobile ? 360 : undefined,
               margin: "0 auto",
               overflow: "visible",
            }}
         >
            <defs>
               <marker
                  id={markerId}
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
               >
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(255,255,255,0.28)" />
               </marker>
            </defs>

            {/* Connectors */}
            {edges.map((e) => (
               <path
                  key={e.id}
                  d={e.d}
                  fill="none"
                  stroke={
                     reducedMotion
                        ? `color-mix(in srgb, ${accent} 55%, transparent)`
                        : "rgba(255,255,255,0.14)"
                  }
                  strokeWidth={1.5}
                  strokeDasharray={e.loop ? "4 4" : undefined}
                  markerEnd={`url(#${markerId})`}
               />
            ))}

            {/* Beams: a short bright dash runs each connector in turn */}
            {animate &&
               edges.map((e, i) => (
                  <motion.path
                     key={`beam-${e.id}`}
                     d={e.d}
                     fill="none"
                     stroke={accent}
                     strokeWidth={2.5}
                     strokeLinecap="round"
                     initial={{
                        pathLength: BEAM,
                        pathSpacing: BEAM_GAP,
                        pathOffset: -BEAM,
                     }}
                     animate={{
                        pathLength: BEAM,
                        pathSpacing: BEAM_GAP,
                        pathOffset: [-BEAM, 1],
                     }}
                     transition={{
                        pathOffset: {
                           duration: STEP,
                           delay: i * STEP,
                           repeat: Infinity,
                           repeatDelay: CYCLE - STEP,
                           ease: "easeInOut",
                        },
                     }}
                  />
               ))}

            {/* Nodes */}
            {NODES.map((node, i) => {
               const box = layout.boxes[i];
               const Icon = node.icon;
               const compact = layout.compact;
               const detailLines = compact
                  ? [node.detail.join(", ")]
                  : node.detail;
               return (
                  <g key={node.id}>
                     <rect
                        x={box.x}
                        y={box.y}
                        width={box.w}
                        height={box.h}
                        rx={10}
                        fill="#0b1114"
                        stroke="rgba(255,255,255,0.1)"
                     />
                     {animate && (
                        <motion.rect
                           x={box.x}
                           y={box.y}
                           width={box.w}
                           height={box.h}
                           rx={10}
                           fill="none"
                           stroke={accent}
                           strokeWidth={1.5}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: [0, 1, 0] }}
                           transition={{
                              duration: STEP * 1.4,
                              delay: i * STEP,
                              repeat: Infinity,
                              repeatDelay: CYCLE - STEP * 1.4,
                              ease: "easeOut",
                           }}
                        />
                     )}
                     <Icon
                        x={box.x + (compact ? 12 : 10)}
                        y={box.y + (compact ? 15 : 11)}
                        size={compact ? 16 : 14}
                        color={accent}
                        aria-hidden="true"
                     />
                     <text
                        x={box.x + (compact ? 38 : 30)}
                        y={box.y + (compact ? 20 : 22)}
                        fill={TEXT_PRIMARY}
                        fontSize={12}
                        fontWeight={600}
                     >
                        {node.title}
                     </text>
                     {detailLines.map((line, li) => (
                        <text
                           key={line}
                           x={box.x + (compact ? 38 : 10)}
                           y={box.y + (compact ? 35 : 42 + li * 14)}
                           fill={TEXT_MUTED}
                           fontSize={10}
                           fontFamily={MONO_FONT}
                        >
                           {line}
                        </text>
                     ))}
                  </g>
               );
            })}
         </svg>

         <p
            style={{
               marginTop: 12,
               color: TEXT_SECONDARY,
               fontSize: 12,
               lineHeight: 1.6,
            }}
         >
            Drift and fairness alarms trigger EventBridge, which restarts
            training. Human approval still gates every deployment.
         </p>
      </div>
   );
};

export default PipelineBeams;
