import type { CSSProperties, ReactNode } from "react";
import { Crosshair, GitBranch, Hammer, TrendingUp } from "lucide-react";
import type { CaseStudy } from "@/types";

/* The four questions an engineer reading a project asks first: what was the
   problem, what did he build, which decisions mattered, what changed. Rows
   read label-left on wide screens and stack on phones (see .case-brief). */

interface CaseStudyBriefProps {
   brief: CaseStudy;
   accent: string;
   /** Optional row under the four answers, e.g. source and demo links. */
   inspect?: ReactNode;
}

const Row = ({
   icon,
   label,
   children,
   highlight = false,
}: {
   icon: ReactNode;
   label: string;
   children: ReactNode;
   highlight?: boolean;
}) => (
   <div className={`case-brief-row${highlight ? " is-outcome" : ""}`}>
      <dt>
         <span aria-hidden="true">{icon}</span>
         {label}
      </dt>
      <dd>{children}</dd>
   </div>
);

const CaseStudyBrief = ({ brief, accent, inspect }: CaseStudyBriefProps) => (
   <dl
      className="case-brief"
      style={{ "--brief-accent": accent } as CSSProperties}
   >
      <Row icon={<Crosshair size={13} />} label="Problem">
         {brief.problem}
      </Row>
      <Row icon={<Hammer size={13} />} label="What I built">
         {brief.built}
      </Row>
      <Row icon={<GitBranch size={13} />} label="Key decisions">
         <ul>
            {brief.decisions.map((decision) => (
               <li key={decision}>{decision}</li>
            ))}
         </ul>
      </Row>
      <Row icon={<TrendingUp size={13} />} label="Outcome" highlight>
         {brief.outcome}
      </Row>
      {inspect && (
         <div className="case-brief-row case-brief-inspect">
            <dt>Inspect</dt>
            <dd>{inspect}</dd>
         </div>
      )}
   </dl>
);

export default CaseStudyBrief;
