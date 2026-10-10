import { useSyncExternalStore } from "react";

/* On/off flag for the "how it's built" annotations, shared by the nav toggle,
   the command palette and the pin layer. */

let on = false;
const listeners = new Set<() => void>();

export const setAnnotationsOn = (next: boolean) => {
   if (on === next) return;
   on = next;
   for (const listener of listeners) listener();
};

export const toggleAnnotations = () => setAnnotationsOn(!on);

const subscribe = (listener: () => void) => {
   listeners.add(listener);
   return () => listeners.delete(listener);
};

export const useAnnotationsOn = () =>
   useSyncExternalStore(
      subscribe,
      () => on,
      () => false,
   );
