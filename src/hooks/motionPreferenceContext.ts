import { createContext } from "react";

export type MotionPreference = "full" | "reduced";

export interface MotionPreferenceValue {
   preference: MotionPreference;
   reducedMotion: boolean;
   setPreference: (preference: MotionPreference) => void;
}

export const MotionPreferenceContext =
   createContext<MotionPreferenceValue | null>(null);
