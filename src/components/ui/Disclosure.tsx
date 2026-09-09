import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DisclosureProps {
   label: ReactNode;
   accentColor: string;
   children: ReactNode;
}

/** Native disclosure keeps keyboard behavior and open state without JS animation state. */
const Disclosure = ({ label, accentColor, children }: DisclosureProps) => (
   <details
      className="disclosure"
      style={{ "--disclosure-accent": accentColor } as CSSProperties}
   >
      <summary>
         <span className="disclosure-label">{label}</span>
         <ChevronDown
            size={16}
            className="disclosure-chevron"
            aria-hidden="true"
         />
      </summary>
      <div className="disclosure-content">{children}</div>
   </details>
);

export default Disclosure;
