import { W16 } from "@pages/projects/covers/kit/sceneTokens";

/* Static 1 px connectors drawn in canvas units across the whole 80 px
   canvas. Nothing here animates a stroke, so no vector-effect is needed. */
const Hairlines = ({ d }: Readonly<{ d: string }>) => (
   <svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      style={{ position: "absolute", inset: 0 }}
   >
      <path d={d} stroke={W16} strokeWidth={1} fill="none" />
   </svg>
);

export default Hairlines;
