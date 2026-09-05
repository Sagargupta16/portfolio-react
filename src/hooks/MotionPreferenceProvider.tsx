import {
   Fragment,
   useCallback,
   useEffect,
   useMemo,
   useState,
   type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { MEDIA_QUERIES } from "@/constants/theme";
import useMediaQuery from "./useMediaQuery";
import {
   MotionPreferenceContext,
   type MotionPreference,
} from "./motionPreferenceContext";

const STORAGE_KEY = "portfolio-motion-preference";
const PREFERENCES = new Set<MotionPreference>(["system", "full", "reduced"]);

const readPreference = (): MotionPreference => {
   if (globalThis.window == null) return "full";
   try {
      const stored = globalThis.localStorage.getItem(STORAGE_KEY);
      return PREFERENCES.has(stored as MotionPreference)
         ? (stored as MotionPreference)
         : "full";
   } catch {
      return "full";
   }
};

export const MotionPreferenceProvider = ({
   children,
}: {
   children: ReactNode;
}) => {
   const systemReducedMotion = useMediaQuery(MEDIA_QUERIES.reducedMotion);
   const [storedPreference, setStoredPreference] =
      useState<MotionPreference>(readPreference);
   const preference = storedPreference;
   const reducedMotion =
      preference === "reduced" ||
      (preference === "system" && systemReducedMotion);

   const setPreference = useCallback((next: MotionPreference) => {
      setStoredPreference(next);
      try {
         globalThis.localStorage.setItem(STORAGE_KEY, next);
      } catch {
         // The in-memory preference still works when storage is unavailable.
      }
   }, []);

   const motionMode = reducedMotion ? "reduced" : "full";

   useEffect(() => {
      document.documentElement.dataset.motion = motionMode;
   }, [motionMode]);

   const value = useMemo(
      () => ({ preference, reducedMotion, setPreference }),
      [preference, reducedMotion, setPreference],
   );

   return (
      <MotionPreferenceContext value={value}>
         <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            {/* Motion copies reducedMotion into each element once, when it
                mounts, so a live change never reaches elements already on
                screen. Re-keying the subtree remounts them with the new value. */}
            <Fragment key={motionMode}>{children}</Fragment>
         </MotionConfig>
      </MotionPreferenceContext>
   );
};
