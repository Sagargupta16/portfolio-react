import { useCallback, useMemo, useSyncExternalStore } from "react";

const getServerSnapshot = (): boolean => false;

const useMediaQuery = (query = "(max-width: 768px)"): boolean => {
   const isClient = globalThis.window != null;

   const mql = useMemo(() => {
      return isClient ? globalThis.matchMedia(query) : null;
   }, [query, isClient]);

   const subscribe = useCallback(
      (callback: () => void) => {
         if (!mql) return () => {};
         mql.addEventListener("change", callback);
         return () => mql.removeEventListener("change", callback);
      },
      [mql],
   );

   const getSnapshot = useCallback(() => (mql ? mql.matches : false), [mql]);

   return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useMediaQuery;
