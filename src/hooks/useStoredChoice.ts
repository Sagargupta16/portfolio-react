import { useCallback, useState } from "react";

const read = <T extends string>(
   key: string,
   options: readonly T[],
   fallback: T,
): T => {
   if (globalThis.window == null) return fallback;
   try {
      const stored = globalThis.localStorage.getItem(key);
      return options.includes(stored as T) ? (stored as T) : fallback;
   } catch {
      return fallback;
   }
};

/**
 * One choice out of a fixed list, remembered in localStorage under `key`. A
 * missing or unknown stored value reads as `fallback`; when storage is
 * unavailable the choice still works for this visit.
 */
const useStoredChoice = <T extends string>(
   key: string,
   options: readonly T[],
   fallback: T,
) => {
   const [choice, setChoice] = useState<T>(() => read(key, options, fallback));

   const choose = useCallback(
      (next: T) => {
         setChoice(next);
         try {
            globalThis.localStorage.setItem(key, next);
         } catch {
            // The in-memory choice still works when storage is unavailable.
         }
      },
      [key],
   );

   return [choice, choose] as const;
};

export default useStoredChoice;
