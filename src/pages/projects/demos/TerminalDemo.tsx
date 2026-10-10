import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   CHROME_BAR_STYLE,
   MONO_FONT,
   TEXT_MUTED,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import type { ProjectDemoProps } from "./demoRegistry";

// Scripts for aws-samples/sample-aws-terraform-org-governance (project 52).
// Commands are the ones its README Quick Start and .gitlab-ci.yml document.
// Plain output lines are stock Terraform messages; "#" lines are annotations
// built from the README and data/projects.json, not tool output.
type Line =
   | { kind: "cmd"; text: string }
   | { kind: "out"; text: string }
   | { kind: "note"; text: string };

interface Script {
   id: string;
   label: string;
   lines: Line[];
}

const VAR_FILE = "examples/standard/terraform.tfvars";

const SCRIPTS: Script[] = [
   {
      id: "plan",
      label: "plan",
      lines: [
         { kind: "cmd", text: "ls examples" },
         {
            kind: "out",
            text: "data-residency  enterprise  minimal  regulated-workload  standard",
         },
         { kind: "cmd", text: "terraform init" },
         { kind: "out", text: "Initializing provider plugins..." },
         { kind: "out", text: "Terraform has been successfully initialized!" },
         { kind: "cmd", text: `terraform plan  -var-file=${VAR_FILE}` },
         {
            kind: "note",
            text: "# standard: SCP + RCP + tag policies + daily backup plan",
         },
         {
            kind: "note",
            text: "# rejected at plan time: duplicate OU key, oversized policy,",
         },
         {
            kind: "note",
            text: "#   unresolvable target, unknown control name",
         },
      ],
   },
   {
      id: "apply",
      label: "apply",
      lines: [
         { kind: "cmd", text: `terraform apply -var-file=${VAR_FILE}` },
         { kind: "out", text: "Do you want to perform these actions?" },
         { kind: "out", text: "  Only 'yes' will be accepted to approve." },
         { kind: "out", text: "  Enter a value: yes" },
         {
            kind: "note",
            text: "# runs only in the management account",
         },
         {
            kind: "note",
            text: "# OU hierarchy up to 5 levels, baselines parent before child",
         },
         {
            kind: "note",
            text: "# 6 policy types as 21 policy documents",
         },
         {
            kind: "note",
            text: "# delegated administrators for 15 services",
         },
      ],
   },
   {
      id: "validate",
      label: "validate",
      lines: [
         { kind: "cmd", text: "terraform fmt -check -recursive -diff" },
         { kind: "cmd", text: "terraform init -backend=false -input=false" },
         { kind: "out", text: "Terraform has been successfully initialized!" },
         { kind: "cmd", text: "terraform validate" },
         { kind: "out", text: "Success! The configuration is valid." },
         { kind: "cmd", text: "tflint --recursive" },
         {
            kind: "note",
            text: "# same checks as pre-commit; CI is scan-only, no AWS access",
         },
      ],
   },
];

const TYPE_MS = 35;
const AFTER_CMD_MS = 320;
const OUTPUT_MS = 170;
const NEXT_TAB_MS = 2600;

interface Progress {
   /** Index of the line currently being typed or waited on. */
   line: number;
   /** Characters typed so far on the current command line. */
   chars: number;
}

const START: Progress = { line: 0, chars: 0 };

// Tallest script plus its prompt line, so switching tabs never jumps.
const MAX_LINES = Math.max(...SCRIPTS.map((s) => s.lines.length)) + 1;

const lineColor = (kind: Line["kind"], accent: string) => {
   if (kind === "cmd") return TEXT_PRIMARY;
   if (kind === "note")
      return `color-mix(in srgb, ${accent} 70%, ${TEXT_MUTED})`;
   return TEXT_SECONDARY;
};

const TerminalDemo = ({ accent, isMobile }: ProjectDemoProps) => {
   const { reducedMotion } = useMotionPreference();
   const frameRef = useRef<HTMLDivElement>(null);
   const inView = useInView(frameRef, { amount: 0.4 });
   const [tab, setTab] = useState(0);
   const [progress, setProgress] = useState<Progress>(START);
   const [userPicked, setUserPicked] = useState(false);

   const script = SCRIPTS[tab];
   const done = reducedMotion || progress.line >= script.lines.length;

   // Drive the typing one timer at a time; each tick schedules the next.
   useEffect(() => {
      if (!inView || reducedMotion) return;

      if (progress.line >= script.lines.length) {
         if (userPicked || tab === SCRIPTS.length - 1) return;
         const id = setTimeout(() => {
            setTab((t) => t + 1);
            setProgress(START);
         }, NEXT_TAB_MS);
         return () => clearTimeout(id);
      }

      const current = script.lines[progress.line];
      const typing =
         current.kind === "cmd" && progress.chars < current.text.length;
      let wait = OUTPUT_MS;
      if (typing) wait = TYPE_MS;
      else if (current.kind === "cmd") wait = AFTER_CMD_MS;

      const id = setTimeout(() => {
         setProgress((p) =>
            typing
               ? { line: p.line, chars: p.chars + 1 }
               : { line: p.line + 1, chars: 0 },
         );
      }, wait);
      return () => clearTimeout(id);
   }, [inView, reducedMotion, progress, script, tab, userPicked]);

   const pickTab = (index: number) => {
      setUserPicked(true);
      setTab(index);
      setProgress(START);
   };

   // Lines fully shown, plus the command currently being typed.
   const visible = done ? script.lines : script.lines.slice(0, progress.line);
   const typingLine =
      !done && script.lines[progress.line]?.kind === "cmd"
         ? script.lines[progress.line].text.slice(0, progress.chars)
         : null;

   return (
      <div
         ref={frameRef}
         style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#090d0f",
            overflow: "hidden",
         }}
      >
         <div
            style={{
               ...CHROME_BAR_STYLE,
               gap: 6,
               padding: isMobile ? "6px 8px" : "6px 12px",
            }}
         >
            <div
               role="group"
               aria-label="Terraform workflow step"
               style={{ display: "flex", gap: 4, minWidth: 0 }}
            >
               {SCRIPTS.map((s, i) => {
                  const active = i === tab;
                  return (
                     <button
                        key={s.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickTab(i)}
                        className="terminal-tab"
                        style={{
                           fontFamily: MONO_FONT,
                           fontSize: 11,
                           color: active ? TEXT_PRIMARY : TEXT_MUTED,
                           background: active
                              ? "rgba(255,255,255,0.06)"
                              : "transparent",
                           borderColor: active
                              ? `color-mix(in srgb, ${accent} 45%, transparent)`
                              : "transparent",
                        }}
                     >
                        {s.label}
                     </button>
                  );
               })}
            </div>
            <span
               style={{
                  marginLeft: "auto",
                  fontFamily: MONO_FONT,
                  fontSize: 10,
                  color: TEXT_MUTED,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
               }}
            >
               management account
            </span>
         </div>

         <div
            className="terminal-body"
            style={{
               padding: isMobile ? "12px 12px 14px" : "14px 16px 16px",
               fontFamily: MONO_FONT,
               fontSize: isMobile ? 11 : 12,
               lineHeight: 1.7,
               minHeight: `calc(${MAX_LINES} * 1.7em + ${isMobile ? 26 : 30}px)`,
            }}
         >
            {/* Long lines wrap rather than scroll: on a phone the comment lines
                carry the facts and a sideways scroll hides them. */}
            <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
               {visible.map((line) => (
                  <div
                     key={`${script.id}-${line.text}`}
                     style={{ color: lineColor(line.kind, accent) }}
                  >
                     {line.kind === "cmd" && (
                        <span style={{ color: accent }} aria-hidden="true">
                           ${" "}
                        </span>
                     )}
                     {line.text}
                  </div>
               ))}
               {typingLine !== null && (
                  <div style={{ color: TEXT_PRIMARY }}>
                     <span style={{ color: accent }} aria-hidden="true">
                        ${" "}
                     </span>
                     {typingLine}
                     <span className="terminal-caret" aria-hidden="true" />
                  </div>
               )}
               {done && (
                  <div>
                     <span style={{ color: accent }} aria-hidden="true">
                        ${" "}
                     </span>
                     {!reducedMotion && (
                        <span className="terminal-caret" aria-hidden="true" />
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default TerminalDemo;
