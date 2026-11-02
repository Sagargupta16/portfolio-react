import { ArrowRight } from "lucide-react";
import { getBlueGreenDemoCopy } from "@data/demos";
import {
   BLUE,
   GREEN,
   MONO_FONT,
   TEXT_MUTED,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import type { BlueGreenPanelCopy } from "@/types";
import CompareSlider from "./CompareSlider";
import type { ProjectDemoProps } from "./demoRegistry";

// Project 13 (Blue Green AWS Terraform), copy in data/projects.json under
// demos."13". Listener ports, ECS on EC2 behind an ALB, CodeBuild + ECR and the
// CodeDeploy-run zero-downtime switch come from that project's entry; the
// green-verified-on-:8080 and blue-drained steps come from the repo README's
// "Blue-Green Deployment Flow".
const COPY = getBlueGreenDemoCopy();

interface PanelProps {
   panel: BlueGreenPanelCopy;
   isAfter: boolean;
}

const ENV_COLOR = { Blue: BLUE, Green: GREEN } as const;

const Panel = ({ panel: { tag, routes }, isAfter }: PanelProps) => {
   return (
      <div
         className="compare-panel"
         style={{
            background: isAfter ? "#0a1210" : "#0a0f16",
            textAlign: isAfter ? "right" : "left",
         }}
      >
         <div
            style={{
               display: "flex",
               flexDirection: isAfter ? "row-reverse" : "row",
               alignItems: "center",
               gap: 8,
               marginBottom: 12,
            }}
         >
            <span
               style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: TEXT_PRIMARY,
                  fontFamily: MONO_FONT,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
               }}
            >
               {tag}
            </span>
         </div>

         <p
            style={{
               fontFamily: MONO_FONT,
               fontSize: 10,
               color: TEXT_MUTED,
               marginBottom: 6,
            }}
         >
            {COPY.stack}
         </p>
         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {routes.map((r) => (
               <div
                  key={r.listener}
                  style={{
                     display: "grid",
                     gridTemplateColumns:
                        "minmax(0, 1fr) 16px minmax(0, 1.2fr)",
                     alignItems: "center",
                     gap: 6,
                     textAlign: "left",
                  }}
               >
                  <span
                     style={{
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        fontFamily: MONO_FONT,
                        fontSize: 11,
                        color: TEXT_SECONDARY,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                     }}
                  >
                     {r.listener}
                  </span>
                  <ArrowRight
                     size={14}
                     aria-hidden="true"
                     style={{ color: TEXT_MUTED }}
                  />
                  <span
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid color-mix(in srgb, ${ENV_COLOR[r.env]} 45%, transparent)`,
                        background: `color-mix(in srgb, ${ENV_COLOR[r.env]} 12%, transparent)`,
                        fontSize: 12,
                        color: TEXT_PRIMARY,
                        minWidth: 0,
                     }}
                  >
                     <span
                        aria-hidden="true"
                        style={{
                           width: 7,
                           height: 7,
                           borderRadius: "50%",
                           flexShrink: 0,
                           background: ENV_COLOR[r.env],
                        }}
                     />
                     <span style={{ fontWeight: 600 }}>{r.env}</span>
                     <span
                        style={{
                           color: TEXT_MUTED,
                           fontFamily: MONO_FONT,
                           fontSize: 10,
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                        }}
                     >
                        {r.state}
                     </span>
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
};

const BlueGreenCompare = ({ accent }: ProjectDemoProps) => (
   <div>
      <CompareSlider
         label={COPY.slider_label}
         accent={accent}
         before={<Panel panel={COPY.before} isAfter={false} />}
         after={<Panel panel={COPY.after} isAfter />}
      />
      {/* Captions sit outside the clipped layers: text cut in half by the
          divider reads as a rendering bug. */}
      <dl className="compare-captions">
         {[COPY.before, COPY.after].map(({ tag, caption }) => (
            <div key={tag}>
               <dt>{tag}</dt>
               <dd>{caption}</dd>
            </div>
         ))}
      </dl>
      <p
         style={{
            marginTop: 8,
            color: TEXT_MUTED,
            fontFamily: MONO_FONT,
            fontSize: 10,
            textAlign: "center",
         }}
      >
         {COPY.hint}
      </p>
   </div>
);

export default BlueGreenCompare;
