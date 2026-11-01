import {
   useCallback,
   useEffect,
   useLayoutEffect,
   useMemo,
   useState,
   type ReactNode,
} from "react";
import { MotionConfig, visualElementStore } from "motion/react";
import {
   MotionPreferenceContext,
   type MotionPreference,
} from "./motionPreferenceContext";

const STORAGE_KEY = "portfolio-motion-preference";
const PREFERENCES = new Set<MotionPreference>(["full", "reduced"]);

// Anything else in storage (including the retired "system" value) reads as
// Full: the OS preference is never consulted, motion stays visible by default.
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
   const [storedPreference, setStoredPreference] =
      useState<MotionPreference>(readPreference);
   const preference = storedPreference;
   const reducedMotion = preference === "reduced";

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

   // Motion copies reducedMotion into each element once, when it mounts, so
   // a live toggle would only reach elements mounted after it. Update the ones
   // already on the page in place instead of remounting the tree, which would
   // drop drafts, filters and focus. A layout effect runs before the motion
   // components start this commit's animations in their passive effects.
   useLayoutEffect(() => {
      for (const node of document.querySelectorAll("*")) {
         const element = visualElementStore.get(node);
         if (element) element.shouldReduceMotion = reducedMotion;
      }
   }, [reducedMotion]);

   const value = useMemo(
      () => ({ preference, reducedMotion, setPreference }),
      [preference, reducedMotion, setPreference],
   );

   return (
      <MotionPreferenceContext value={value}>
         <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            {children}
         </MotionConfig>
      </MotionPreferenceContext>
   );
};
