import { lazy, Suspense } from "react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { useAnnotationsOn } from "@utils/annotationsState";

const AnnotationsLayer = lazy(() => import("./AnnotationsLayer"));

/* Truthy on purpose (a falsy fallback renders ErrorBoundary's full panel): a
   failed pin layer chunk shows no pins instead of blanking the page. */
const OMIT_LAYER = <></>;

/* Always mounted and tiny: the pin layer chunk loads the first time the
   annotations are switched on and unmounts again when they go off. */
const AnnotationsHost = () => {
   const on = useAnnotationsOn();
   if (!on) return null;
   return (
      <ErrorBoundary fallback={OMIT_LAYER}>
         <Suspense fallback={null}>
            <AnnotationsLayer />
         </Suspense>
      </ErrorBoundary>
   );
};

export default AnnotationsHost;
