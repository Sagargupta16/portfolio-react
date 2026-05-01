import { GREEN } from "@/constants/theme";

interface PresentIndicatorProps {
   /** Show just the pulsing dot (true) or the dot + "Present" label (false). */
   dotOnly?: boolean;
}

/**
 * Green pulsing dot that marks a currently-active role on the experience timeline.
 * When `dotOnly` is false, the dot is rendered with a trailing "Present" label
 * suitable for use inside a flex row (the parent controls the gap).
 */
const PresentIndicator = ({ dotOnly = false }: PresentIndicatorProps) => {
   const dot = (
      <span
         className="animate-glow-pulse"
         aria-hidden="true"
         style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: GREEN,
            boxShadow: `0 0 6px ${GREEN}99`,
            flexShrink: 0,
         }}
      />
   );

   if (dotOnly) return dot;

   return (
      <>
         {dot}
         <span>Present</span>
      </>
   );
};

export default PresentIndicator;
