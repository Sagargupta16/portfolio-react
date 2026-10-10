import { lazy, Suspense } from "react";
import { useAnnotationsOn } from "@utils/annotationsState";

const AnnotationsLayer = lazy(() => import("./AnnotationsLayer"));

/* Always mounted and tiny: the pin layer chunk loads the first time the
   annotations are switched on and unmounts again when they go off. */
const AnnotationsHost = () => {
   const on = useAnnotationsOn();
   if (!on) return null;
   return (
      <Suspense fallback={null}>
         <AnnotationsLayer />
      </Suspense>
   );
};

export default AnnotationsHost;
