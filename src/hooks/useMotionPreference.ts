import { use } from "react";
import { MotionPreferenceContext } from "./motionPreferenceContext";

const useMotionPreference = () => {
   const context = use(MotionPreferenceContext);
   if (!context) {
      throw new Error(
         "useMotionPreference must be used within MotionPreferenceProvider",
      );
   }
   return context;
};

export default useMotionPreference;
