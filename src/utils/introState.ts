import { useSyncExternalStore } from "react";

/* Tiny shared flag: is the opening splash still covering the page?
   IntroSplash flips it; the hero holds its entrance until it clears, so the
   choreography plays as the curtain lifts instead of hidden underneath it. */

let introActive = false;
const listeners = new Set<() => void>();

const emit = () => {
   for (const listener of listeners) listener();
};

export const markIntroActive = () => {
   introActive = true;
};

export const markIntroDone = () => {
   if (!introActive) return;
   introActive = false;
   emit();
};

const subscribe = (listener: () => void) => {
   listeners.add(listener);
   return () => listeners.delete(listener);
};

/** True once no splash is covering the page (always true when none ran). */
export const useIntroDone = () =>
   useSyncExternalStore(
      subscribe,
      () => !introActive,
      () => true,
   );
