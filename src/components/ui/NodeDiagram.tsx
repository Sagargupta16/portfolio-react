import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MONO_FONT, TEXT_MUTED } from "@/constants/theme";

interface DiagramNode {
   label: string;
   icon: string;
   x: number;
   y: number;
}

interface DiagramEdge {
   from: number;
   to: number;
}

interface NodeDiagramProps {
   nodes: DiagramNode[];
   edges: DiagramEdge[];
   title?: string;
   subtitle?: string;
   width?: number;
   height?: number;
}

const NodeDiagram = ({
   nodes,
   edges,
   title,
   subtitle,
   width = 320,
   height = 200,
}: NodeDiagramProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -60px 0px",
   });

   return (
      <motion.div
         ref={ref}
         initial={{ opacity: 0, y: 30 }}
         animate={isInView ? { opacity: 1, y: 0 } : {}}
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgb(var(--ch-white) / 0.06)",
            background: "rgb(var(--ch-glass) / 0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
         }}
      >
         {/* Diagram area */}
         <div
            style={{
               position: "relative",
               flex: 1,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               padding: "28px 20px",
               minHeight: height,
            }}
         >
            <svg
               viewBox={`0 0 ${width} ${height}`}
               width="100%"
               height={height}
               style={{ overflow: "visible" }}
            >
               {/* Animated dashed edges */}
               {edges.map((edge, i) => {
                  const from = nodes[edge.from];
                  const to = nodes[edge.to];
                  return (
                     <motion.line
                        key={`edge-${i}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="rgb(var(--ch-white) / 0.12)"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={
                           isInView
                              ? { pathLength: 1, opacity: 1 }
                              : { pathLength: 0, opacity: 0 }
                        }
                        transition={{
                           delay: 0.4 + i * 0.15,
                           duration: 0.8,
                           ease: [0.16, 1, 0.3, 1],
                        }}
                     />
                  );
               })}

               {/* Nodes */}
               {nodes.map((node, i) => (
                  <motion.g
                     key={`node-${i}`}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={
                        isInView
                           ? { scale: 1, opacity: 1 }
                           : { scale: 0, opacity: 0 }
                     }
                     transition={{
                        delay: 0.2 + i * 0.12,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                     }}
                     style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                     {/* Outer glow ring */}
                     <circle
                        cx={node.x}
                        cy={node.y}
                        r={26}
                        fill="none"
                        stroke="rgb(var(--ch-cyan) / 0.08)"
                        strokeWidth={1}
                        strokeDasharray="4 3"
                     />
                     {/* Node circle */}
                     <circle
                        cx={node.x}
                        cy={node.y}
                        r={20}
                        fill="rgb(var(--ch-glass) / 0.8)"
                        stroke="rgb(var(--ch-white) / 0.1)"
                        strokeWidth={1}
                     />
                     {/* Icon emoji */}
                     <text
                        x={node.x}
                        y={node.y + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={16}
                     >
                        {node.icon}
                     </text>
                     {/* Label */}
                     <text
                        x={node.x}
                        y={node.y + 36}
                        textAnchor="middle"
                        fill={TEXT_MUTED}
                        fontSize={9}
                        fontFamily={MONO_FONT}
                     >
                        {node.label}
                     </text>
                  </motion.g>
               ))}
            </svg>
         </div>

         {/* Caption */}
         {(title || subtitle) && (
            <div style={{ padding: "0 16px 16px" }}>
               {title && (
                  <div
                     style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgb(var(--ch-white) / 0.9)",
                        marginBottom: 4,
                     }}
                  >
                     {title}
                  </div>
               )}
               {subtitle && (
                  <div
                     style={{
                        fontSize: 12,
                        color: TEXT_MUTED,
                        lineHeight: 1.5,
                     }}
                  >
                     {subtitle}
                  </div>
               )}
            </div>
         )}
      </motion.div>
   );
};

export default NodeDiagram;
