import { CHROME_HAIR } from "./canvasKit";

/* Static 1 px connectors drawn in canvas units across the whole canvas (80 px
   square, or the lead card's wider one). Nothing here animates a stroke, so
   no vector-effect is needed. */
const Hairlines = ({
   d,
   width = 80,
}: Readonly<{ d: string; width?: number }>) => (
   <svg
      aria-hidden="true"
      width={width}
      height={80}
      viewBox={`0 0 ${width} 80`}
      style={{ position: "absolute", inset: 0 }}
   >
      <path d={d} stroke={CHROME_HAIR} strokeWidth={1} fill="none" />
   </svg>
);

export default Hairlines;
